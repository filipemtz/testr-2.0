
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework import exceptions
from rest_framework.permissions import IsAuthenticated

class UserLogoutAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        
        user = request.user
        if user is None:
            raise exceptions.AuthenticationFailed('User is none!')
        token = Token.objects.get(user=request.user)
        token.delete()

        return Response({"success": True, "detail": "Logged out!"})
