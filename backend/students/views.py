from rest_framework.views import APIView
from rest_framework import permissions
from .serializers import StudentRegisterSerializer
from rest_framework.response import Response
# Create your views here.

class StudentRegisterView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = StudentRegisterSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(user=request.user)
        return Response("registered successfully!")


