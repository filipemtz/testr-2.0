from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import exceptions
from ..authentication import create_access_token, decode_refresh_token
from ..models import UserToken
import datetime
from datetime import timezone

class UserRefreshAPIView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        id = decode_refresh_token(refresh_token)

        if not UserToken.objects.filter(
            user_id=id, 
            token=refresh_token, 
            expired_at__gt=datetime.datetime.now(tz=timezone.utc)
        ).exists():
            raise exceptions.AuthenticationFailed('unauthenticated oiasda')
        
        access_token = create_access_token(id)
        return Response({
            'token': access_token
        })