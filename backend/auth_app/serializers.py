from django.contrib.auth.models import User
from rest_framework import serializers

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True, allow_blank=False)
    first_name = serializers.CharField(required=True, allow_blank=False)
    second_name = serializers.CharField(required=True, allow_blank=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'second_name']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
    
