from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum, Count, Q, F
from django.db import models
from decimal import Decimal
import datetime
import uuid

from .models import (
    RiderPayrollRule, RiderSettlement, RiderPaymentLog, RiderWallet,
    DeliveryBonusRule, PenaltyRule, PayrollConfiguration, VehicleTypePaySetting
)
from .serializers import (
    RiderPayrollRuleSerializer, RiderSettlementSerializer, 
    RiderPaymentLogSerializer, RiderWalletSerializer,
    DeliveryBonusRuleSerializer, PenaltyRuleSerializer, PayrollConfigurationSerializer,
    VehicleTypePaySettingSerializer
)
from apps.tracking.models import RiderProfile, Shipment

class PayrollRuleViewSet(viewsets.ModelViewSet):
    queryset = RiderPayrollRule.objects.all()
    serializer_class = RiderPayrollRuleSerializer
    permission_classes = [permissions.IsAdminUser]

class DeliveryBonusRuleViewSet(viewsets.ModelViewSet):
    queryset = DeliveryBonusRule.objects.all()
    serializer_class = DeliveryBonusRuleSerializer
    permission_classes = [permissions.IsAdminUser]

class PenaltyRuleViewSet(viewsets.ModelViewSet):
    queryset = PenaltyRule.objects.all()
    serializer_class = PenaltyRuleSerializer
    permission_classes = [permissions.IsAdminUser]

class PayrollConfigurationViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAdminUser]

    def list(self, request):
        config = PayrollConfiguration.get_config()
        serializer = PayrollConfigurationSerializer(config)
        return Response(serializer.data)

    @action(detail=False, methods=['post', 'patch'])
    def update_config(self, request):
        config = PayrollConfiguration.get_config()
        serializer = PayrollConfigurationSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RiderPayrollViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAdminUser]

    def _get_current_month_stats(self, rider, start_of_month):
        # Count delivered shipments this month
        delivered_shipments = Shipment.objects.filter(
            rider=rider,
            status='Delivered',
            delivered_at__gte=start_of_month
        )
        
        deliveries_count = delivered_shipments.count()
        
        # Base earnings based on rider's vehicle type if settings exist (single source of truth)
        base_per_delivery = Decimal('0.00')
        if rider.vehicle_type:
            vehicle_pay_setting = VehicleTypePaySetting.objects.filter(
                vehicle_type__iexact=rider.vehicle_type,
                is_active=True
            ).first()
            if vehicle_pay_setting:
                base_per_delivery = vehicle_pay_setting.base_pay
        
        delivery_earnings = Decimal(str(deliveries_count)) * Decimal(str(base_per_delivery))
        
        # Calculate incentive based on milestone from DeliveryBonusRule
        incentive = Decimal('0.00')
        applicable_bonus = DeliveryBonusRule.objects.filter(
            min_deliveries__lte=deliveries_count, 
            is_active=True
        ).order_by('-min_deliveries').first()
        
        if applicable_bonus:
            incentive = applicable_bonus.bonus_amount
        
        # Petrol calculation (Mocked 3km per delivery if not tracked)
        config = PayrollConfiguration.get_config()
        total_distance = Decimal(str(deliveries_count * 3)) 
        petrol_rate = config.petrol_rate_per_km
        petrol_allowance = total_distance * petrol_rate
        
        # Penalties: Late deliveries
        late_deliveries_count = delivered_shipments.filter(
            delivered_at__gt=models.F('estimated_delivery_time')
        ).count() if hasattr(Shipment, 'estimated_delivery_time') else 0
        
        late_penalty_rule = PenaltyRule.objects.filter(penalty_name__icontains='Late', is_active=True).first()
        late_penalty_rate = late_penalty_rule.deduction_amount if late_penalty_rule else Decimal('5.00')
        penalties_amount = Decimal(str(late_deliveries_count * late_penalty_rate))
        
        # Final Net Payable
        base_salary = getattr(rider.salary_config, 'monthly_fixed_salary', Decimal('0.00')) if hasattr(rider, 'salary_config') else Decimal('0.00')
        net_payable = base_salary + delivery_earnings + incentive + petrol_allowance - penalties_amount
        
        return {
            'base_salary': base_salary,
            'deliveries_count': deliveries_count,
            'delivery_earnings': delivery_earnings,
            'total_incentive': incentive,
            'total_distance': total_distance,
            'petrol_allowance': petrol_allowance,
            'late_deliveries': late_deliveries_count,
            'penalties_amount': penalties_amount,
            'net_payable': net_payable
        }

    def list(self, request):
        now = timezone.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        riders = RiderProfile.objects.filter(is_active=True).select_related('user')
        
        data = []
        for rider in riders:
            # Check if settlement already exists for this month
            settlement = RiderSettlement.objects.filter(rider=rider, month=start_of_month.date()).first()
            
            if settlement:
                stats = {
                    'id': rider.id,
                    'username': rider.user.username,
                    'deliveries': settlement.deliveries_count,
                    'earnings': float(settlement.delivery_earnings),
                    'incentive': float(settlement.total_incentive),
                    'petrol_allowance': float(settlement.petrol_allowance),
                    'penalties': float(settlement.penalties_amount),
                    'net_payable': float(settlement.net_payable),
                    'status': settlement.status,
                    'settlement_id': settlement.id
                }
            else:
                stats_calc = self._get_current_month_stats(rider, start_of_month)
                stats = {
                    'id': rider.id,
                    'username': rider.user.username,
                    'deliveries': stats_calc['deliveries_count'],
                    'earnings': float(stats_calc['delivery_earnings']),
                    'incentive': float(stats_calc['total_incentive']),
                    'petrol_allowance': float(stats_calc['petrol_allowance']),
                    'penalties': float(stats_calc['penalties_amount']),
                    'net_payable': float(stats_calc['net_payable']),
                    'status': 'Pending',
                    'settlement_id': None
                }
            data.append(stats)
            
        return Response(data)

    @action(detail=True, methods=['post'])
    def run_payroll(self, request, pk=None):
        rider = RiderProfile.objects.get(pk=pk)
        now = timezone.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).date()
        
        # Prevent duplicate settlements
        if RiderSettlement.objects.filter(rider=rider, month=start_of_month).exists():
            return Response({'error': 'Payroll already generated for this month.'}, status=400)
            
        stats = self._get_current_month_stats(rider, timezone.make_aware(datetime.datetime.combine(start_of_month, datetime.time.min)))
        
        settlement = RiderSettlement.objects.create(
            rider=rider,
            month=start_of_month,
            **stats
        )
        
        return Response(RiderSettlementSerializer(settlement).data)

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        settlement = RiderSettlement.objects.get(pk=pk)
        if settlement.status == 'Paid':
            return Response({'error': 'Already paid.'}, status=400)
            
        payment_method = request.data.get('payment_method', 'Bank Transfer')
        transaction_id = request.data.get('transaction_id', f"PAY-{uuid.uuid4().hex[:8].upper()}")
        
        settlement.status = 'Paid'
        settlement.save()
        
        RiderPaymentLog.objects.create(
            settlement=settlement,
            transaction_id=transaction_id,
            payment_method=payment_method,
            admin_notes=request.data.get('notes', '')
        )
        
        # Update Wallet
        wallet, _ = RiderWallet.objects.get_or_create(rider=settlement.rider)
        wallet.total_salary_earned += settlement.net_payable
        wallet.total_salary_paid += settlement.net_payable
        wallet.last_payout_date = timezone.now()
        wallet.save()
        
        return Response({'status': 'success', 'message': 'Payroll marked as paid.'})

class RiderSettlementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RiderSettlement.objects.all()
    serializer_class = RiderSettlementSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'rider':
            return self.queryset.filter(rider__user=user)
        return self.queryset

class RiderWalletViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RiderWallet.objects.all()
    serializer_class = RiderWalletSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'rider':
            return self.queryset.filter(rider__user=user)
        return self.queryset

    @action(detail=False, methods=['get'])
    def salary_rules(self, request):
        if request.user.role != 'rider':
            return Response({'error': 'Unauthorized'}, status=403)
            
        rider = request.user.rider_profile
        today = timezone.now().date()
        start_of_today = timezone.datetime.combine(today, datetime.time.min).replace(tzinfo=timezone.utc)
        
        # 1. Fetch Rules
        vehicle_rules = VehicleTypePaySetting.objects.filter(is_active=True).values('vehicle_type', 'base_pay')
        bonus_rules = DeliveryBonusRule.objects.filter(is_active=True).order_by('min_deliveries').values('min_deliveries', 'bonus_amount')
        penalty_rules = PenaltyRule.objects.filter(is_active=True).values('penalty_name', 'deduction_amount')
        config = PayrollConfiguration.get_config()
        
        # 2. Fetch Stats
        deliveries_today = Shipment.objects.filter(
            rider=rider,
            status='Delivered',
            delivered_at__gte=start_of_today
        ).count()
        
        # Determine Base Pay
        rider_base_pay = Decimal('0.00') # Default
        if rider.vehicle_type:
            vs = VehicleTypePaySetting.objects.filter(vehicle_type__iexact=rider.vehicle_type, is_active=True).first()
            if vs:
                rider_base_pay = vs.base_pay
        
        # Determine Bonus
        incentive = Decimal('0.00')
        applicable_bonus = DeliveryBonusRule.objects.filter(
            min_deliveries__lte=deliveries_today, 
            is_active=True
        ).order_by('-min_deliveries').first()
        if applicable_bonus:
            incentive = applicable_bonus.bonus_amount
            
        # Earnings Today (Base + Incentive - mock penalties)
        earnings_today = (Decimal(deliveries_today) * rider_base_pay) + incentive
        
        # Wallet Pending
        wallet = RiderWallet.objects.filter(rider=rider).first()
        pending_settlement = wallet.pending_payout if wallet else Decimal('0.00')
        
        return Response({
            'rules': {
                'vehicle_pay': list(vehicle_rules),
                'bonus_slabs': list(bonus_rules),
                'penalties': list(penalty_rules),
                'config': {
                    'petrol_km_limit': config.petrol_km_limit,
                    'petrol_rate_per_km': float(config.petrol_rate_per_km)
                },
                'rider_base_pay': float(rider_base_pay)
            },
            'stats': {
                'deliveries_today': deliveries_today,
                'earnings_today': float(earnings_today),
                'pending_settlement': float(pending_settlement)
            }
        })


class VehicleTypePaySettingViewSet(viewsets.ModelViewSet):
    queryset = VehicleTypePaySetting.objects.all()
    serializer_class = VehicleTypePaySettingSerializer
    permission_classes = [permissions.IsAdminUser]

    def list(self, request, *args, **kwargs):
        # Pre-populate default vehicle pay configurations if database is empty
        if not VehicleTypePaySetting.objects.exists():
            default_settings = [
                {'vehicle_type': 'Bike', 'base_pay': Decimal('30.00')},
                {'vehicle_type': 'Scooter', 'base_pay': Decimal('28.00')},
                {'vehicle_type': 'Bicycle', 'base_pay': Decimal('20.00')},
            ]
            for setting in default_settings:
                VehicleTypePaySetting.objects.create(**setting)
        
        return super().list(request, *args, **kwargs)

