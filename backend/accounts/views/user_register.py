from ..serializers import UserRegisterSerializer

from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.authentication import TokenAuthentication
from  rest_framework.response import Response
from rest_framework.authtoken.models import Token


class UserRegisterView(APIView):
    """
    API view for user registration.
    
    This view allows users to register by sending a POST request with their registration data.
    Upon successful registration, a token is generated and returned in the response along with a cookie containing the token.
    """
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (TokenAuthentication,)
    
    def post(self, request):
        """
        Handle the HTTP POST request for user registration.

        Args:
            request (HttpRequest): The HTTP request object.

        Returns:
            Response: The HTTP response object.

        """
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.create(serializer.validated_data)
            token = Token.objects.create(user=user)
            response = Response({'token': token.key}, status=status.HTTP_201_CREATED)
            response.set_cookie(key='token', value=token.key, httponly=True)
            return response

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)