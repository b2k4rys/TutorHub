from rest_framework import serializers
from .models import Message, Participant, Conversation
from django.contrib.contenttypes.models import ContentType
from students.models import Student
from tutors.models import Tutor
from students.serializers import StudentStudentDetailViewSerializer
from tutors.serializers import TutorDetailViewSerializer
class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.user.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender_name', 'content', 'timestamp']

# A generic serializer to display any user profile (Tutor or Student)
class GenericUserSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    role = serializers.SerializerMethodField()

    def get_role(self, obj):
        return obj.__class__.__name__

    def to_representation(self, instance):
        if isinstance(instance, Tutor):
            return TutorDetailViewSerializer(instance, context=self.context).data 
        if isinstance(instance, Student):
            return StudentStudentDetailViewSerializer(instance, context=self.context).data
        return super().to_representation(instance)

# A serializer for the Participant model to fetch user details
class ParticipantSerializer(serializers.ModelSerializer):
    user = GenericUserSerializer(read_only=True)

    class Meta:
        model = Participant
        fields = ['user']

# The main serializer for chat list
class ConversationListSerializer(serializers.ModelSerializer):
    other_participant = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'other_participant']

    def get_other_participant(self, obj):

        other_participants_map = self.context.get('other_participants_map', {})
        participant = other_participants_map.get(obj.id)
        if participant:
            return ParticipantSerializer(participant).data
        return None
