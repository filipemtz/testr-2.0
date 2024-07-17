# serializers.py
from rest_framework import serializers
from django.contrib.auth.models import Group

class UserInfoSerializer(serializers.Serializer):
    groups = serializers.ListField(
        child=serializers.CharField(max_length=100)
    )
    is_superuser = serializers.BooleanField()
