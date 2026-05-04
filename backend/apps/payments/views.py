from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
import uuid
import csv
from django.http import HttpResponse
from django.db.models import Sum, Count
from .models import Payment, VendorPayout
from .serializers import PaymentSerializer, CreatePaymentSerializer, VendorPayoutSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['transaction_id', 'order__id', 'user__username', 'user__first_name', 'user__last_name']

    def get_serializer_class(self):
        if self.action == 'create':
            return CreatePaymentSerializer
        return PaymentSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Payment.objects.select_related('order', 'user', 'order__vendor')
        
        if not (user.role in ['superadmin', 'admin'] or user.is_staff):
            if user.role == 'vendor':
                vendor = getattr(user, 'vendor_profile', None)
                if vendor:
                    queryset = queryset.filter(order__vendor=vendor)
                else:
                    return Payment.objects.none()
            else:
                queryset = queryset.filter(user=user)

        # Advanced Filtering
        status_filter = self.request.query_params.get('status')
        method_filter = self.request.query_params.get('method')
        vendor_id = self.request.query_params.get('vendor_id')
        min_amount = self.request.query_params.get('min_amount')
        max_amount = self.request.query_params.get('max_amount')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if status_filter and status_filter != 'All':
            queryset = queryset.filter(status=status_filter)
        if method_filter:
            queryset = queryset.filter(method=method_filter)
        if vendor_id:
            queryset = queryset.filter(order__vendor_id=vendor_id)
        if min_amount:
            queryset = queryset.filter(amount__gte=min_amount)
        if max_amount:
            queryset = queryset.filter(amount__lte=max_amount)
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)

        return queryset

    def perform_create(self, serializer):
        transaction_id = str(uuid.uuid4()).replace('-', '').upper()[:16]
        serializer.save(user=self.request.user, transaction_id=transaction_id)

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAdminUser])
    def update_status(self, request, pk=None):
        payment = self.get_object()
        new_status = request.data.get('status')
        valid_statuses = [s[0] for s in Payment.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Choose from {valid_statuses}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        payment.status = new_status
        payment.save()
        return Response(PaymentSerializer(payment).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def refund(self, request, pk=None):
        payment = self.get_object()
        reason = request.data.get('reason', 'User requested refund')
        
        if payment.status == 'Refunded':
            return Response({'error': 'Payment already refunded'}, status=status.HTTP_400_BAD_REQUEST)
        
        # In a real app, you'd call a payment gateway here
        payment.status = 'Refunded'
        payment.refund_reason = reason
        payment.refund_transaction_id = f"REF-{uuid.uuid4().hex[:8].upper()}"
        payment.save()
        
        return Response(PaymentSerializer(payment).data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def dashboard_stats(self, request):
        from django.utils import timezone
        today = timezone.now().date()
        
        total_revenue = Payment.objects.filter(status='Paid').aggregate(Sum('amount'))['amount__sum'] or 0
        today_revenue = Payment.objects.filter(status='Paid', created_at__date=today).aggregate(Sum('amount'))['amount__sum'] or 0
        pending_payments = Payment.objects.filter(status__in=['Pending', 'COD Pending']).aggregate(Sum('amount'))['amount__sum'] or 0
        failed_transactions = Payment.objects.filter(status='Failed').count()
        refunded_amount = Payment.objects.filter(status='Refunded').aggregate(Sum('amount'))['amount__sum'] or 0

        return Response({
            'total_revenue': float(total_revenue),
            'today_revenue': float(today_revenue),
            'pending_payments': float(pending_payments),
            'failed_transactions': failed_transactions,
            'refunded_amount': float(refunded_amount),
        })

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def bulk_export(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="customer_transactions.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Transaction ID', 'Customer Name', 'Customer Email', 'Order ID', 'Method', 'Amount', 'Status', 'Date', 'Vendor'])
        
        for p in queryset:
            customer_name = f"{p.user.first_name} {p.user.last_name}".strip() or p.user.username
            writer.writerow([
                p.transaction_id,
                customer_name,
                p.user.email,
                p.order.id,
                p.method,
                p.amount,
                p.status,
                p.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                p.order.vendor.shop_name if p.order.vendor else "N/A"
            ])
            
        return response


class VendorPayoutViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = VendorPayoutSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['id', 'order__id', 'vendor__shop_name', 'transaction_id']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'superadmin' or user.is_staff or user.is_superuser:
            queryset = VendorPayout.objects.select_related('vendor', 'order').all()
        elif user.role == 'vendor':
            vendor = getattr(user, 'vendor_profile', None)
            if vendor:
                queryset = VendorPayout.objects.select_related('vendor', 'order').filter(vendor=vendor)
            else:
                queryset = VendorPayout.objects.none()
        else:
            queryset = VendorPayout.objects.none()

        # Advanced Filtering
        vendor_id = self.request.query_params.get('vendor_id')
        status_param = self.request.query_params.get('status')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        min_amount = self.request.query_params.get('min_amount')
        max_amount = self.request.query_params.get('max_amount')
        
        if vendor_id:
            queryset = queryset.filter(vendor_id=vendor_id)
        if status_param and status_param != 'All':
            queryset = queryset.filter(status=status_param)
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
        if min_amount:
            queryset = queryset.filter(final_amount__gte=min_amount)
        if max_amount:
            queryset = queryset.filter(final_amount__lte=max_amount)
            
        return queryset

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def dashboard_stats(self, request):
        from django.utils import timezone
        from django.db.models import Sum, Count
        now = timezone.now()
        first_day_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        pending_payout = VendorPayout.objects.filter(status='Pending').aggregate(Sum('final_amount'))['final_amount__sum'] or 0
        paid_this_month = VendorPayout.objects.filter(status='Paid', payout_date__gte=first_day_of_month).aggregate(Sum('final_amount'))['final_amount__sum'] or 0
        platform_commission = VendorPayout.objects.aggregate(Sum('commission_amount'))['commission_amount__sum'] or 0
        refund_holds = VendorPayout.objects.filter(status='Hold').aggregate(Sum('final_amount'))['final_amount__sum'] or 0
        active_vendors = Vendor.objects.filter(status='Approved').count()

        return Response({
            'pending_payout': float(pending_payout),
            'paid_this_month': float(paid_this_month),
            'platform_commission': float(platform_commission),
            'refund_holds': float(refund_holds),
            'active_vendors': active_vendors
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def mark_as_paid(self, request, pk=None):
        payout = self.get_object()
        payout.status = 'Paid'
        payout.method = request.data.get('method', 'bank_transfer')
        payout.reference_number = request.data.get('reference_number', '')
        from django.utils import timezone
        payout.payout_date = timezone.now()
        payout.save()
        return Response({'status': 'Payout marked as paid', 'payout': VendorPayoutSerializer(payout).data})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def hold(self, request, pk=None):
        payout = self.get_object()
        payout.status = 'Hold'
        payout.save()
        return Response({'status': 'Payout put on hold'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        payout = self.get_object()
        payout.status = 'Pending'
        payout.save()
        return Response({'status': 'Payout approved for processing'})

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def bulk_payout(self, request):
        payout_ids = request.data.get('payout_ids', [])
        method = request.data.get('method', 'bank_transfer')
        reference_number = request.data.get('reference_number', f"BULK-{uuid.uuid4().hex[:8].upper()}")
        
        payouts = VendorPayout.objects.filter(id__in=payout_ids, status='Pending')
        count = payouts.count()
        
        from django.utils import timezone
        payout_date = timezone.now()
        
        payouts.update(
            status='Paid',
            method=method,
            reference_number=reference_number,
            payout_date=payout_date
        )
        
        return Response({'status': 'Bulk payout completed', 'count': count})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def download_statement(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="vendor_payout_statement.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Payout ID', 'Vendor', 'Order ID', 'Gross Amount', 'Commission', 'Net Payable', 'Status', 'Due Date', 'Payout Date', 'Method', 'Reference'])
        
        for p in queryset:
            writer.writerow([
                p.transaction_id,
                p.vendor.shop_name,
                p.order.id,
                p.total_amount,
                p.commission_amount,
                p.final_amount,
                p.status,
                p.due_date.strftime('%Y-%m-%d') if p.due_date else 'N/A',
                p.payout_date.strftime('%Y-%m-%d') if p.payout_date else 'N/A',
                p.get_method_display(),
                p.reference_number
            ])
            
        return response
