from django.urls import path
from .views import HomeworkCreateView, HomeworkSubmitView, HomeworkGrade, HomeworksView, HomeworkViewSubmissions, HomeworkViewSubmission, HomeworkDetailView, HomeworkComment

urlpatterns = [
    path("classroom/<int:classroom_id>/assign/", HomeworkCreateView.as_view()),
    path('<int:homework_id>/submit/', HomeworkSubmitView.as_view(), name='Submit homework'),
    path('<int:homework_id>/grade/', HomeworkGrade.as_view(), name='Grade homework'),



    path('classroom/<int:classroom_id>/homework/<int:homework_id>', HomeworkDetailView.as_view(), name="view homework details"),

    path('classroom/<int:classroom_id>/', HomeworksView.as_view(), name='View all homeworks in classroom'),
    path('classroom/<int:classroom_id>/homework/<int:assigned_homework_id>/', HomeworkViewSubmissions.as_view(), name="View all homework submission"),


    # ENDPOINT FOR VIEWING PARTICULAR SUBMISSION 
    path('classroom/<int:classroom_id>/homework/<int:assigned_homework_id>/submission/<int:submission_id>/', HomeworkViewSubmission.as_view(),name="View particular homework submission"),


    # ADD COMMENT TO THE HOMEWORK
    path('classroom/<int:classroom_id>/homework/<int:homework_id>/comment/', HomeworkComment.as_view())
]

