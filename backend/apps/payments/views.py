from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
import uuid
from .models import Payment
from .serializers import PaymentSerializer, CreatePaymentSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return CreatePaymentSerializer
        return PaymentSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Payment.objects.select_related('order', 'user').all()
        return Payment.objects.select_related('order', 'user').filter(user=user)

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
