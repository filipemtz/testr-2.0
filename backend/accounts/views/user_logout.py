
from rest_framework.views import APIView
from rest_framework.response import Response
from ..authentication import JWTAuthentication
from ..models import UserToken

class UserLogoutAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        UserToken.objects.filter(token=refresh_token).delete()

        response = Response()
        response.delete_cookie('refresh_token')
        response.data = {
            'message': 'success'
        }
        
        return response
