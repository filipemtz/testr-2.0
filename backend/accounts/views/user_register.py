
from rest_framework.views import APIView
from  rest_framework.response import Response
from rest_framework import exceptions
from ..serializers import UserRegisterSerializer

class UserRegisterAPIView(APIView):
    def post(self, request):
        data =  request.data
        
        if data['password'] != data['password_confirm']:
            raise exceptions.APIException('Passwords do not match')
        
        serializer = UserRegisterSerializer(data=data)
        
        serializer.is_valid(raise_exception=True)
        serializer.save()
    
        return Response({"success": True, "user": serializer.data})