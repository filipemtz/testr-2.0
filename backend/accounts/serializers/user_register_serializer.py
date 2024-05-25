from django.contrib.auth.models import User
from rest_framework import serializers

class UserRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer class for user registration.

    This serializer is used to validate and serialize user registration data.
    It includes fields for username, email, password, and password2.
    """

    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
    password2 = serializers.CharField(min_length=6, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        """
        Create and return a new user instance.

        This method is called when a valid user registration data is provided.
        It creates a new user using the validated data and returns the user instance.
        """
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
    
    def validate(self, data):
        """
        Validate the user registration data.

        This method is called to validate the user registration data before creating a new user.
        It performs various validations such as checking password length, password confirmation,
        uniqueness of username and email, etc. If any validation fails, it raises a validation error.
        """
        username = data['username'].strip()
        email = data['email'].strip()
        password = data['password'].strip()
        password2 = data['password2'].strip()
        
        if not password or len(password) < 8:
            raise serializers.ValidationError({'password': 'A senha deve conter no mínimo 8 caracteres.'})
        
        if not password2:
            raise serializers.ValidationError({'password2': 'Este campo é obrigatório.'})
        
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Senhas não conferem.'})
        
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({'username': 'Este usuário já existe.'})
        
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({'email': 'Este email já está em uso.'})
        
        return data