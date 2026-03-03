from accounts.permissions import IsStudentSafeMethods, IsTeacher, ReadOnly
from django.db.models import Exists, OuterRef
from rest_framework import permissions, viewsets
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models.section import Section
from ..models.submission import Submission
from ..serializers.question_serializer import QuestionSerializer
from ..serializers.section_serializer import SectionSerializer


class SectionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """

    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [IsTeacher | IsStudentSafeMethods]
    authentication_classes = [SessionAuthentication, TokenAuthentication]

    @action(detail=True, methods=["get"])
    def questions(self, request, pk=None):
        """
        Retrieve all questions associated with a specific section.
        """
        section = self.get_object()

        if request.user in section.course.teachers.all():
            questions = section.question_set.all()
        else:
            questions = section.question_set.filter(visible=True)

        # busca submissoes da questao feitas pelo usuario e marcadas como sucesso
        solved_subquery = Submission.objects.filter(
            question=OuterRef("pk"), student=request.user, status="SC"
        )

        questions = questions.annotate(solved=Exists(solved_subquery))

        serializer = QuestionSerializer(
            questions, many=True, context={"request": request}
        )
        return Response(serializer.data)

    # Retorna apenas as seções que o usuário está relacionado por meio dos cursos
    def get_queryset(self):
        user = self.request.user
        return (
            Section.objects.filter(course__teachers=user)
            | Section.objects.filter(course__students=user)
        ).distinct()
