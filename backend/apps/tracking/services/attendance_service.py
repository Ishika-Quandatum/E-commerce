from django.utils import timezone
from decimal import Decimal
from rest_framework.exceptions import ValidationError
from apps.tracking.models import Attendance

class AttendanceService:
    @staticmethod
    def punch_in(rider):
        today = timezone.now().date()
        
        # Check if already punched in
        if Attendance.objects.filter(rider=rider, date=today, check_out__isnull=True).exists():
            raise ValidationError({'error': 'You are already punched in'})
            
        attendance = Attendance.objects.create(
            rider=rider,
            check_in=timezone.now()
        )
        rider.availability_status = 'Online'
        rider.save()
        return attendance

    @staticmethod
    def punch_out(rider):
        attendance = Attendance.objects.filter(rider=rider, check_out__isnull=True).order_by('-check_in').first()
        
        if not attendance:
            raise ValidationError({'error': 'No active session found. Please punch in first.'})
            
        attendance.check_out = timezone.now()
        
        # Calculate working hours
        duration = attendance.check_out - attendance.check_in
        hours = Decimal(duration.total_seconds() / 3600).quantize(Decimal('0.00'))
        attendance.working_hours = hours
        attendance.save()
        
        rider.availability_status = 'Offline'
        rider.save()
        
        return attendance
