from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import PlatformSetting
from .serializers import PlatformSettingSerializer

def send_contact_email(name, email, subject, message):
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    from django.conf import settings

    sender_email = settings.EMAIL_HOST_USER
    sender_password = settings.EMAIL_HOST_PASSWORD
    recipient_email = 'sarasneha97@gmail.com'

    # Create message container
    msg = MIMEMultipart()
    msg['From'] = f"Contact Us Form <{sender_email}>"
    msg['To'] = recipient_email
    msg['Subject'] = f"[Contact Us] {subject} - from {name}"
    msg['Reply-To'] = email

    # Email body
    body = f"""You have received a new message from the Contact Us form:

--------------------------------------------------
Full Name: {name}
Email Address: {email}
Subject: {subject}
--------------------------------------------------

Message:
{message}
"""

    msg.attach(MIMEText(body, 'plain'))

    try:
        # Create SMTP session
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()  # Enable security
        server.login(sender_email, sender_password)  # Login
        text = msg.as_string()
        server.sendmail(sender_email, recipient_email, text)
        server.quit()
        return True
    except Exception as e:
        print(f"SMTP Error: {e}")
        return False


class PlatformSettingViewSet(viewsets.ModelViewSet):
    queryset = PlatformSetting.objects.all()
    serializer_class = PlatformSettingSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'platform_stats', 'contact']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def list(self, request, *args, **kwargs):
        settings = PlatformSetting.get_settings()
        serializer = self.get_serializer(settings)
        return Response(serializer.data)

    @action(detail=False, methods=['patch', 'post'])
    def update_settings(self, request):
        settings = PlatformSetting.get_settings()
        # Ensure we handle potential string-to-decimal conversions and partial updates
        serializer = self.get_serializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        # If invalid, return the specific error details
        return Response({
            "error": "Validation Failed",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def platform_stats(self, request):
        from apps.users.models import User
        from apps.products.models import Product
        from apps.vendors.models import Vendor
        
        customers = User.objects.filter(role='customer').count()
        products = Product.objects.filter(status='Active').count()
        vendors = Vendor.objects.filter(status='Approved').count()
        cities = Vendor.objects.filter(status='Approved').exclude(city__isnull=True).values('city').distinct().count()
        
        return Response({
            'customers': customers + 150,
            'products': products + 120,
            'sellers': vendors + 15,
            'cities': cities + 5
        })

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def contact(self, request):
        name = request.data.get('name')
        email = request.data.get('email')
        subject = request.data.get('subject')
        message = request.data.get('message')

        if not name or not email or not subject or not message:
            return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Call email sending utility
        success = send_contact_email(name, email, subject, message)
        if success:
            return Response({'success': 'Your message has been sent successfully.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Failed to send your message. Please try again later.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

