from django.urls import include, path
from rest_framework import routers

from .views import CourseViewSet, section_view, question_view

router = routers.DefaultRouter()

router.register(r'courses', CourseViewSet)
router.register(r'questions', question_view.QuestionViewSet)
router.register(r'sections', section_view.SectionViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]
