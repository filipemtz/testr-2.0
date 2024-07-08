from rest_framework.views import APIView

from rest_framework.response import Response
from rest_framework import exceptions
from ..authentication import JWTAuthentication

class ChagePasswordAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    def post(self, request):
        user = request.user
        data = request.data
        print(user)
        print(data)
        if user.check_password(data['currentPassword']):
            user.set_password(data['newPassword'])
            user.save()
            return Response({
                'message': 'success'
            })
        else:
            raise exceptions.AuthenticationFailed('unauthenticated')