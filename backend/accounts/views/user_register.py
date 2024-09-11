
from rest_framework.views import APIView
from  rest_framework.response import Response
from rest_framework import exceptions
from ..serializers import UserRegisterSerializer, UserSerializer
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
import csv

class UserRegisterAPIView(APIView):
    def post(self, request):
        data =  request.data
        
        if data['password'] != data['password_confirm']:
            raise exceptions.APIException('Passwords do not match')
        
        serializer = UserRegisterSerializer(data=data)
        
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        token, created = Token.objects.get_or_create(user=serializer.instance)
        
        user = User.objects.filter(username=serializer.instance.username).first()
    
        return Response({
            'token': token.key, 
            'user': UserSerializer(user).data
        })
    