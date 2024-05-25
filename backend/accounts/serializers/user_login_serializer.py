from rest_framework import serializers
from django.contrib.auth import authenticate

class UserLoginSerializer(serializers.Serializer):
	"""
	Serializer for user login.
	"""
	username = serializers.CharField(max_length=150)
	password = serializers.CharField(min_length=8, write_only=True)
	
	def check_user(self, validated_data):
		"""
		Check if the provided username and password are valid.
		
		Args:
			username (str): The username to check.
			password (str): The password to check.
		
		Returns:
			User: The authenticated user if the username and password are valid.
		
		Raises:
			serializers.ValidationError: If the username or password is incorrect.
		"""
		user = authenticate(username=validated_data['username'], password=validated_data['password'])
		if not user:
			raise serializers.ValidationError({'message': 'Usuário ou senha incorretos.'})
		return user
