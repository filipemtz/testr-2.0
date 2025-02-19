from rest_framework.views import APIView

from rest_framework.response import Response
from rest_framework import exceptions
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication

class ChagePasswordAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        data = request.data

        if user.check_password(data['currentPassword']):
            user.set_password(data['newPassword'])
            user.save()
            return Response({
                'message': 'success'
            })
        else:
            raise exceptions.AuthenticationFailed('unauthenticated')