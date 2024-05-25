from ..serializers import UserLoginSerializer

from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.authentication import TokenAuthentication
from  rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import AuthenticationFailed


class UserLoginView(APIView):
    """
    API view for user login.

    This view allows users to log in by providing their credentials.
    Upon successful login, a token is generated and returned in the response.
    The token is also stored as a cookie for subsequent requests.

    Methods:
        post(request): Handles the POST request for user login.
    """

    permission_classes = (permissions.AllowAny,)
    authentication_classes = (TokenAuthentication,)
    
    def post(self, request):
        """
        Handles the POST request for user login.

        Args:
            request (HttpRequest): The HTTP request object.

        Returns:
            Response: The HTTP response object containing the token if login is successful,
                      or the error messages if login fails.
        """
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.check_user(serializer.validated_data)

            if not user:
                raise AuthenticationFailed('User not Found!')
            
            if user:
                token, _ = Token.objects.get_or_create(user=user)
                response = Response({'token': token.key}, status=status.HTTP_200_OK)
                response.set_cookie(key='token', value=token.key, httponly=True)
                return response
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)