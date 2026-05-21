import calendar
from decimal import Decimal
from django.db import transaction as db_transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from apps.tracking.models import (
    RiderProfile, RiderWallet, SalaryConfiguration, RiderSalaryTransaction,
    RiderIncentive, CODCollection, RiderFinancialLog, RiderWalletTransaction,
    RiderMonthlySettlement, Shipment
)

class FinanceService:
    @staticmethod
    def process_delivery_earnings(shipment, p_method):
        wallet, _ = RiderWallet.objects.get_or_create(rider=shipment.rider)
        
        # Calculate base pay based on vehicle type from VehicleTypePaySetting (Single source of truth)
        rider = shipment.rider
        delivery_earning = Decimal('0.00')
        if rider and rider.vehicle_type:
            from apps.payroll.models import VehicleTypePaySetting
            vehicle_pay_setting = VehicleTypePaySetting.objects.filter(
                vehicle_type__iexact=rider.vehicle_type,
                is_active=True
            ).first()
            if vehicle_pay_setting:
                delivery_earning = vehicle_pay_setting.base_pay
        
        wallet.total_earned += delivery_earning
        wallet.current_balance += delivery_earning
        if 'cod' in p_method or 'cash' in p_method:
            wallet.total_cod_collected += Decimal(str(shipment.order.total_price))
            wallet.pending_cod_amount += Decimal(str(shipment.order.total_price))
        wallet.save()
        
        RiderSalaryTransaction.objects.create(
            rider=shipment.rider,
            order=shipment.order,
            amount=delivery_earning,
            transaction_type='Delivery Earnings',
            description=f'Earning for delivering order #{shipment.order.id}',
            status='Pending'
        )

        FinanceService.calculate_incentives(shipment.rider)
        return delivery_earning

    @staticmethod
    def calculate_incentives(rider):
        now = timezone.now()
        
        # A. Milestone Bonus (10 deliveries = ₹100)
        delivered_count = Shipment.objects.filter(rider=rider, status='Delivered').count()
        if delivered_count == 10:
            bonus_amount = Decimal('100.00')
            RiderIncentive.objects.create(
                rider=rider,
                amount=bonus_amount,
                reason="10 Deliveries Milestone Reached",
                incentive_type='Milestone'
            )
            RiderSalaryTransaction.objects.create(
                rider=rider,
                amount=bonus_amount,
                transaction_type='Peak Hour Bonus', 
                description="Milestone Bonus: 10 Deliveries Completed",
                status='Pending'
            )
            rider.wallet.total_earned += bonus_amount
            rider.wallet.current_balance += bonus_amount
            rider.wallet.save()

        # B. Peak Hour Bonus (6:00 PM to 9:00 PM = ₹20)
        if 18 <= now.hour < 21:
            peak_bonus = Decimal('20.00')
            RiderIncentive.objects.create(
                rider=rider,
                amount=peak_bonus,
                reason=f"Peak Hour Delivery Bonus ({now.strftime('%H:%M')})",
                incentive_type='PeakHour'
            )
            RiderSalaryTransaction.objects.create(
                rider=rider,
                amount=peak_bonus,
                transaction_type='Peak Hour Bonus',
                description=f"Peak Hour Incentive at {now.strftime('%H:%M')}",
                status='Pending'
            )
            rider.wallet.total_earned += peak_bonus
            rider.wallet.current_balance += peak_bonus
            rider.wallet.save()

    @staticmethod
    def add_bonus(rider, amount, reason="Manual Admin Bonus"):
        amount_dec = Decimal(str(amount))
        
        RiderIncentive.objects.create(
            rider=rider,
            amount=amount_dec,
            reason=reason,
            incentive_type='Manual'
        )
        RiderSalaryTransaction.objects.create(
            rider=rider,
            amount=amount_dec,
            transaction_type='Referral Bonus', 
            description=f"Admin Bonus: {reason}",
            status='Pending'
        )
        
        wallet = rider.wallet
        wallet.total_earned += amount_dec
        wallet.current_balance += amount_dec
        wallet.save()
        return wallet

    @staticmethod
    def mark_submitted(cod, submitted_val, notes=""):
        if cod.status == 'Submitted':
            raise ValidationError('Already submitted')
        
        try:
            submitted_val = Decimal(str(submitted_val))
        except Exception:
            submitted_val = cod.amount

        shortage = cod.amount - submitted_val
        
        cod.status = 'Submitted' if shortage <= 0 else 'Disputed'
        cod.submitted_amount = submitted_val
        cod.submitted_at = timezone.now()
        cod.admin_notes = notes or cod.admin_notes
        cod.save()
        
        wallet = cod.rider.wallet
        wallet.pending_cod_amount -= cod.amount
        wallet.total_cod_submitted += submitted_val
        if shortage > 0:
            wallet.shortage_amount += shortage
        wallet.save()

        RiderFinancialLog.objects.create(
            rider=cod.rider,
            amount=submitted_val,
            log_type='Submission',
            description=f"COD Submission for Order #{cod.shipment.order.id}. Collected: {cod.amount}, Submitted: {submitted_val}. Shortage: {shortage}"
        )
        return shortage

    @staticmethod
    def verify_submission(trans, status_update='Verified', notes=''):
        if trans.status == 'Verified':
            raise ValidationError('Already verified')
            
        if status_update == 'Verified':
            trans.status = 'Verified'
            trans.verified_at = timezone.now()
            trans.notes = notes
            trans.save()
            
            wallet = trans.rider.wallet
            wallet.pending_cod_amount -= trans.amount
            wallet.total_cod_submitted += trans.amount
            wallet.save()
            return True
            
        return False

    @staticmethod
    def pay_rider(settlement, payment_method='Bank Transfer'):
        if settlement.status == 'Paid':
            raise ValidationError('Already paid')
            
        settlement.status = 'Paid'
        settlement.payment_method = payment_method
        settlement.paid_at = timezone.now()
        settlement.save()
        
        wallet, _ = RiderWallet.objects.get_or_create(rider=settlement.rider)
        wallet.current_balance -= settlement.final_salary
        wallet.save()
        
        RiderFinancialLog.objects.create(
            rider=settlement.rider,
            amount=settlement.final_salary,
            log_type='Payout',
            description=f"Monthly Settlement for {settlement.month.strftime('%B %Y')} paid via {payment_method}"
        )
        
        RiderSalaryTransaction.objects.filter(
            rider=settlement.rider,
            status='Pending'
        ).update(status='Paid')
        
        return True

    @staticmethod
    def run_payroll():
        today = timezone.now().date()
        month_start = today.replace(day=1)
        _, last_day = calendar.monthrange(today.year, today.month)
        
        riders = RiderProfile.objects.filter(is_active=True)
        created_count = 0
        
        for rider in riders:
            txs = RiderSalaryTransaction.objects.filter(
                rider=rider, 
                status='Pending'
            )
            
            base_salary = Decimal('0.00')
            if hasattr(rider, 'salary_config'):
                base_salary = rider.salary_config.monthly_fixed_salary
                
            incentives = txs.filter(transaction_type__icontains='Earning').aggregate(models.Sum('amount'))['amount__sum'] or Decimal('0.00')
            bonuses = txs.filter(transaction_type__icontains='Bonus').aggregate(models.Sum('amount'))['amount__sum'] or Decimal('0.00')
            penalties = txs.filter(transaction_type__icontains='Penalty').aggregate(models.Sum('amount'))['amount__sum'] or Decimal('0.00')
            
            shortage = rider.cod_collections.filter(status='Shortage').aggregate(models.Sum('amount'))['amount__sum'] or Decimal('0.00')
            
            final_salary = base_salary + incentives + bonuses - penalties - shortage
            
            if base_salary == 0 and incentives == 0 and bonuses == 0 and penalties == 0 and shortage == 0:
                RiderMonthlySettlement.objects.filter(rider=rider, month=month_start, status='Pending').delete()
                continue

            settlement, created = RiderMonthlySettlement.objects.get_or_create(
                rider=rider,
                month=month_start,
                defaults={'status': 'Pending', 'final_salary': Decimal('0.00')}
            )

            if settlement.status != 'Pending':
                continue
                
            settlement.base_salary = base_salary
            settlement.per_order_incentive = incentives
            settlement.attendance_bonus = bonuses
            settlement.late_penalty = penalties
            settlement.cash_shortage_deduction = shortage
            settlement.final_salary = max(final_salary, Decimal('0.00'))
            settlement.completed_deliveries = txs.filter(transaction_type__icontains='Earning').count()
            settlement.save()

            if created:
                created_count += 1
                
        return created_count
