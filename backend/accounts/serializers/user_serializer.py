
from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth import authenticate

class UserSerializer(serializers.HyperlinkedModelSerializer):
    """
    Serializer class for the User model.

    This serializer is used to convert User model instances into JSON
    representations and vice versa. It specifies the fields that should be
    included in the serialized output.

    Attributes:
        model (class): The User model class.
        fields (list): The fields to be included in the serialized output.

    """
    class Meta:
        model = User
        fields = ['url', 'username', 'email', 'groups']
