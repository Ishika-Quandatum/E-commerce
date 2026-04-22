from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import PlatformSetting
from .serializers import PlatformSettingSerializer

class PlatformSettingViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAdminUser]

    def list(self, request):
        settings = PlatformSetting.get_settings()
        serializer = PlatformSettingSerializer(settings)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'])
    def update_settings(self, request):
        settings = PlatformSetting.get_settings()
        serializer = PlatformSettingSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
