from rest_framework.views import APIView
from .serializers import TutorAddSerializer
from rest_framework.response import Response
from rest_framework import status
class TutorAddView(APIView):

    def post(self, request):
        serializer = TutorAddSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tutor = serializer.save(user=request.user)
        return Response(
            {
                "message": "Classroom created successfully!",
                "classroom": TutorAddSerializer(tutor).data
            },
            status=status.HTTP_201_CREATED
        )
