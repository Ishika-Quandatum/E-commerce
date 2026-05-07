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
    facebook_link = models.URLField(blank=True, null=True, default="")
    instagram_link = models.URLField(blank=True, null=True, default="")
    twitter_link = models.URLField(blank=True, null=True, default="")
    linkedin_link = models.URLField(blank=True, null=True, default="")

    class Meta:
        verbose_name = "Platform Setting"
        verbose_name_plural = "Platform Settings"

    def __str__(self):
        return f"Settings: {self.platform_name}"

    @classmethod
    def get_settings(cls):
        settings, created = cls.objects.get_or_create(pk=1)
        return settings
