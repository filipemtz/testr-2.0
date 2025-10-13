
from django.contrib.auth.models import User, Group
from rest_framework.serializers import ModelSerializer

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }
        
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        group = validated_data.pop('group', None)
        instance = self.Meta.model(**validated_data)
        
        if password is not None:
            instance.set_password(password)
            
        if group is not None:
            group_instance = Group.objects.get(name=group)
            if group_instance is not None:
                instance.groups.add(group_instance)

        instance.save()
        return instance
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        groups = validated_data.pop('groups', None)
        
        instance = super().update(instance, validated_data)
        
        if groups is not None:
            instance.groups.set(groups)
        
        if password is not None:
            instance.set_password(password)
        
        instance.save()
        return instance