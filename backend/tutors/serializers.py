from rest_framework import serializers
from .models import Tutor
class TutorAddSerializer(serializers.ModelSerializer):

    class Meta:
        model = Tutor
        fields = ['user', 'subject', 'description']
        read_only_fields = ['user']

        