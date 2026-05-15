from django.db import models

class PlatformSetting(models.Model):
    platform_name = models.CharField(max_length=100, default="QuanStore")
    global_commission = models.DecimalField(max_digits=5, decimal_places=2, default=10.0)
    two_factor_enabled = models.BooleanField(default=False)
    auto_update_check = models.BooleanField(default=True)
    last_update_check = models.DateTimeField(auto_now=True)

    # Contact & Social Media
    support_phone = models.CharField(max_length=20, blank=True, null=True, default="+91 9876543210")
    support_email = models.EmailField(blank=True, null=True, default="support@quanstore.com")
    store_address = models.TextField(blank=True, null=True, default="")
    facebook_link = models.URLField(blank=True, null=True, default="")
    instagram_link = models.URLField(blank=True, null=True, default="")
    twitter_link = models.URLField(blank=True, null=True, default="")
    linkedin_link = models.URLField(blank=True, null=True, default="")

    # Localization
    currency = models.CharField(max_length=10, default="INR")
    language = models.CharField(max_length=20, default="English")
    timezone = models.CharField(max_length=50, default="Asia/Kolkata")

    # Tax Settings
    tax_type = models.CharField(max_length=20, default="GST")
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    tax_included = models.BooleanField(default=True)

    # Payment Gateways
    payment_razorpay = models.BooleanField(default=True)
    payment_paypal = models.BooleanField(default=False)
    payment_cod = models.BooleanField(default=True)
    payment_wallet = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Platform Setting"
        verbose_name_plural = "Platform Settings"

    def __str__(self):
        return f"Settings: {self.platform_name}"

    @classmethod
    def get_settings(cls):
        settings, created = cls.objects.get_or_create(pk=1)
        return settings
