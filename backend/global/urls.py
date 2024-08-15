from django.contrib import admin
from django.urls import include, path
from django.conf.urls.static import static
from django.conf import settings
urlpatterns = [
    path('', include('backend.urls')),
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
