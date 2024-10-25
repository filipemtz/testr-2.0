from django.urls import include, path
from rest_framework import routers

from .views import *

router = routers.DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'sections', SectionViewSet)
router.register(r'inputs_outputs', InputOutputViewSet)
router.register(r'question-files', QuestionFileViewSet)
router.register(r'submissions-debug', SubmissionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('courses/<int:course_id>/register-students/', CourseRegisterStudentsAPIView.as_view(), name="course-registration"),
    path('courses/<int:course_id>/report/', CourseReportAPIView.as_view(), name="course-report"),
    path('courses/<int:course_id>/teachers/', CourseTeachersAPIView.as_view(), name="course-teachers"),
    path('courses/<int:course_id>/add-teacher/', CourseAddTeacherAPIView.as_view(), name="add-teacher"),
    path('courses/<int:course_id>/remove-teacher/', CourseRemoveTeacherAPIView.as_view(), name="remove-teacher"),
    path('courses/<int:course_id>/copy/', CourseCreateCopyAPIView.as_view(), name="course-copy"),
    path('questions/<int:question_id>/report/', QuestionReportAPIView.as_view(), name="question-report"),
    path('submissions/get/', GetSubmissionAPIView.as_view(), name='get-submission'),
    path('submissions/add/', AddSubmissionAPIView.as_view(), name='add-submission'),
    path('submissions/reset-status/', ResetStatusSubmissionAPIView.as_view(), name='reset-status-submission'),
    path('submissions/list/', GetAllStudentsSubmissionsAPIView.as_view(), name='all-students-submissions'),
    path('submissions/reset-all/', ResetSubmitionForAllStudentsAPIView.as_view(), name='reset-all-submissions'),
]
