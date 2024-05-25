from rest_framework.authtoken.models import Token
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.authentication import TokenAuthentication
from  rest_framework.response import Response


class UserLogoutView(APIView):
	"""
	View for logging out a user.
 
	This view allows users to log out by sending a POST request.
	
	Methods:
		- post(request): Handles the POST request for logging out a user.
	"""

	permission_classes = (permissions.AllowAny,)
	authentication_classes = (TokenAuthentication,)

	def post(self, request):
			"""
			POST method for logging out a user.

			Parameters:
			- request: The HTTP request object.

			Returns:
			- If the user is logged out successfully, returns a response with status code 200 and a message 'User logged out.'
			- If the user is already logged out, returns a response with status code 200 and a message 'User is already logged out.'
			"""
			token = request.COOKIES.get('token', None)
			Token.objects.filter(key=token).delete()
			if token:
				response = Response(status=status.HTTP_200_OK, data={'message': 'User logged out.'})
				response.delete_cookie('token')
				return response

			return Response(data={'message': 'User is already logged out.'}, status=status.HTTP_200_OK)
