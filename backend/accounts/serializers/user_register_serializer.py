from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from rest_framework import serializers

class UserRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer class for user registration.

    This serializer is used to validate and serialize user registration data.
    It includes fields for username, email, password, and group.
    """
    group = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'group']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        """
        Create and return a new user instance.

        This method is called when a valid user registration data is provided.
        It creates a new user using the validated data and returns the user instance.
        """
        password = validated_data.pop('password', None)
        group = validated_data.pop('group', None)
        instance = self.Meta.model(**validated_data)
        
        if password is not None:
            instance.set_password(password)
            
        if group is not None:
            group_instance = Group.objects.get(name=group)
            if group_instance is None:
                raise serializers.ValidationError({'group': f'{group} Grupo inválido.'})
            
        instance.save()
        instance.groups.add(group_instance)
        return instance
    
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
        group = data['group'].strip()
        
        if not password or len(password) < 6:
            raise serializers.ValidationError({'password': 'A senha deve conter no mínimo 6 caracteres.'})

        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({'username': 'Este usuário já existe.'})
        
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({'email': 'Este email já está em uso.'})
        
        if not Group.objects.filter(name=group).exists():
            raise serializers.ValidationError({'group': f'{group} Grupo inválido.'})
        
        return data
