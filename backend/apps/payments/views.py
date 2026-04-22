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
        queryset = Payment.objects.select_related('order', 'user')
        
        if user.role in ['superadmin', 'admin'] or user.is_staff:
            return queryset.all()
            
        if user.role == 'vendor':
            vendor = getattr(user, 'vendor_profile', None)
            if vendor:
                return queryset.filter(order__vendor=vendor)
            return Payment.objects.none()
            
        return queryset.filter(user=user)

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

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def dashboard_stats(self, request):
        total_customer_payments = Payment.objects.filter(status='Completed').aggregate(Sum('amount'))['amount__sum'] or 0
        pending_vendor_payouts = VendorPayout.objects.filter(status='Pending').aggregate(Sum('final_amount'))['final_amount__sum'] or 0
        total_commission_earned = VendorPayout.objects.all().aggregate(Sum('commission_amount'))['commission_amount__sum'] or 0
        failed_transactions = Payment.objects.filter(status='Failed').count()

        return Response({
            'total_customer_payments': total_customer_payments,
            'pending_vendor_payouts': pending_vendor_payouts,
            'total_commission_earned': total_commission_earned,
            'failed_transactions': failed_transactions,
        })

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def bulk_export(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="customer_transactions.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Transaction ID', 'Customer Name', 'Customer Email', 'Order ID', 'Method', 'Amount', 'Status', 'Date'])
        
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
                p.created_at.strftime('%Y-%m-%d %H:%M:%S')
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

        vendor_id = self.request.query_params.get('vendor_id')
        status = self.request.query_params.get('status')
        
        if (user.role == 'superadmin' or user.is_staff or user.is_superuser) and vendor_id:
            queryset = queryset.filter(vendor_id=vendor_id)
        if status:
            queryset = queryset.filter(status=status)
            
        return queryset

    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        payout = self.get_object()
        payout.status = 'Paid'
        from django.utils import timezone
        payout.payout_date = timezone.now()
        payout.save()
        return Response({'status': 'Payout marked as paid'})
