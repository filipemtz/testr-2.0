from django.urls import include, path
from rest_framework import routers
from rest_framework import routers

from .views import *

router = routers.DefaultRouter()

router.register(r'users', UserViewSet)
router.register(r'groups', GroupViewSet)

urlpatterns = [
    path('login/', UserLoginAPIView.as_view(), name='login'),
    path('logout/', UserLogoutAPIView.as_view(), name='logout'),
    path('register/', UserRegisterAPIView.as_view(), name='register'),
    path('register-student-csv/', StudentCSVRegisterAPIView.as_view(), name='register-student'),
    path('profile/', UserProfileAPIView.as_view(), name='profile'),
    # path('refresh/', UserRefreshAPIView.as_view(), name='refresh'),
    path('change-password/', ChagePasswordAPIView.as_view(), name='change-password'),
    path('user-info/', UserInfoAPIView.as_view(), name='user-info'),
    path('', include(router.urls)),
]





