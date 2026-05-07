from rest_framework import serializers
from .models import PlatformSetting

class PlatformSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformSetting
        fields = [
            'platform_name', 
            'global_commission', 
            'two_factor_enabled', 
            'auto_update_check', 
            'last_update_check',
            'support_phone',
            'support_email',
            'facebook_link',
            'instagram_link',
            'twitter_link',
            'linkedin_link'
        ]
