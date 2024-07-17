# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from django.contrib.auth.models import Permission
from ..serializers import UserInfoSerializer

class UserInfoAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        user = request.user
        groups = user.groups.values_list('name', flat=True)
        permissions = user.user_permissions.values_list('codename', flat=True)
        if user.is_superuser:
            permissions = Permission.objects.values_list('codename', flat=True)
        data = {
            'groups': list(groups),
            'is_superuser': user.is_superuser,
            'permissions': list(permissions)
        }
        serializer = UserInfoSerializer(data=data)
        if serializer.is_valid():
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
