from django.contrib import admin
from .models import RiderProfile, Shipment, TrackingHistory

@admin.register(RiderProfile)
class RiderProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'vehicle_number', 'is_active')
    search_fields = ('user__username', 'vehicle_number')

@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ('tracking_number', 'order', 'rider', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('tracking_number', 'order__id')

@admin.register(TrackingHistory)
class TrackingHistoryAdmin(admin.ModelAdmin):
    list_display = ('shipment', 'status', 'timestamp')
    list_filter = ('timestamp',)
