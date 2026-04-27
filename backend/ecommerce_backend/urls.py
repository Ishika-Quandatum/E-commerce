from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth & Users
    path('api/users/', include('apps.users.urls')),

    # Catalog
    path('api/categories/', include('apps.categories.urls')),
    path('api/products/', include('apps.products.urls')),

    # Shopping
    path('api/cart/', include('apps.cart.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/vendors/', include('apps.vendors.urls')),
    path('api/tracking/', include('apps.tracking.urls')),
    path('api/core/', include('apps.core.urls')),
    path('api/promotions/', include('apps.promotions.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
