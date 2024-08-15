from django.urls import include, path
from rest_framework import routers
from .views import (
    CourseViewSet, QuestionViewSet, SectionViewSet, 
    QuestionFileViewSet, input_output_view, SubmissionViewSet, 
    GetSubmissionAPIView, AddSubmissionAPIView,ResetStatusSubmissionAPIView, GetAllStudentsSubmissionsAPIView
)

router = routers.DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'sections', SectionViewSet)
router.register(r'inputs_outputs', input_output_view.InputOutputViewSet)
router.register(r'question-files', QuestionFileViewSet)
router.register(r'submissions-debug', SubmissionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('submissions/get/', GetSubmissionAPIView.as_view(), name='get-submission'),
    path('submissions/add/', AddSubmissionAPIView.as_view(), name='add-submission'),
    path('submissions/reset-status/', ResetStatusSubmissionAPIView.as_view(), name='reset-status-submission'),
    path('submissions/list/', GetAllStudentsSubmissionsAPIView.as_view(), name='all-students-submissions'),
]
