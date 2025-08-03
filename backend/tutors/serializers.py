from rest_framework import serializers
from .models import Tutor
from classroom.models import Classroom
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
        fields = ['id', 'username', 'first_name', 'last_name', 'subject', 'description', 'phone', 'telegram_username']



class ClassroomStudentsSerializer(serializers.ModelSerializer):

    class Meta:
        model = Classroom
        fields = ['students']