from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'order', 'amount', 'method', 'status', 'transaction_id', 'created_at']
    list_filter = ['status', 'method', 'created_at']
    search_fields = ['user__username', 'transaction_id', 'order__id']
    list_editable = ['status']
    readonly_fields = ['transaction_id', 'created_at', 'updated_at']
