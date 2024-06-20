
from rest_framework.views import APIView
from rest_framework.response import Response

from ..serializers import UserSerializer
from ..authentication import JWTAuthentication

class UserProfileAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    def get(self, request):
        return Response(UserSerializer(request.user).data)