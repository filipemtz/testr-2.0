
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
        print(data)
        
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
    
class StudentCSVRegisterAPIView(APIView):
    def post(self, request):
        csv_file = request.FILES['file']
        decoded_file = csv_file.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file, delimiter=';')
        
        responses = []
        
        for row in reader:
            data = {
                'username': row['username'],
                'password': row['password'],
                'password_confirm': row['password'], 
                'email': row['email'],
                'first_name': row['first_name'],
                'last_name': row['last_name'],
                'group': 'student'
            }
            
            serializer = UserRegisterSerializer(data=data)
            
            if serializer.is_valid():
                serializer.save()
                token, created = Token.objects.get_or_create(user=serializer.instance)
                user = User.objects.filter(username=serializer.instance.username).first()
                responses.append({
                    'token': token.key, 
                    'user': UserSerializer(user).data
                })
            else:
                responses.append({'error': serializer.errors, 'data': data})
        
        return Response(responses)