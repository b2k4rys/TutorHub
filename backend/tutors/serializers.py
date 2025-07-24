from rest_framework import serializers
from .models import Tutor
class TutorAddSerializer(serializers.ModelSerializer):

    class Meta:
        model = Tutor
        fields = ['user', 'subject', 'description']
        read_only_fields = ['user']

        
class TutorDetailViewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')


    class Meta: 
        model = Tutor
        fields = ['username', 'first_name', 'last_name', 'subject', 'description', 'phone', 'telegram_username']