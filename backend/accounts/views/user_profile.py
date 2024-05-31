from django.contrib.auth.models import User
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from ..serializers import UserSerializer

class UserProfileView(APIView):
    """
    A view for retrieving the user profile.
    This view requires authentication and token-based authentication is used.
    """

    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (TokenAuthentication,)

    def get(self, request):
        """
        Retrieve the user profile.
        This method retrieves the user profile based on the provided token in the request's cookies.
        If the token is valid and associated with a user, the user's username is returned in the response.
        Returns:
            A Response object with the user's username if the token is valid and associated with a user.
            Otherwise, returns a Response with a 404 status code.
        """
        token = request.COOKIES.get('token', None)
        if token:
            try:
                user = Token.objects.get(key=token).user
                serializer = UserSerializer(user, context={'request': request})  # Passando o contexto aqui
            except Token.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
            except User.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST, data={"detail": "Token not provided"})
