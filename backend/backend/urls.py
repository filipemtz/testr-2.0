from django.urls import include, path
from rest_framework import routers

from .views import CourseViewSet, QuestionViewSet, SectionViewSet, QuestionFileViewSet, input_output_view

router = routers.DefaultRouter()

router.register(r'courses', CourseViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'sections', SectionViewSet)
router.register(r'inputs_outputs', input_output_view.InputOutputViewSet)
router.register(r'question-files', QuestionFileViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
