from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Submission
from ..serializers import SubmissionSerializer
from rest_framework.status import HTTP_400_BAD_REQUEST
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, TokenAuthentication

class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes=[IsAuthenticated]
    authentication_classes = [SessionAuthentication, TokenAuthentication]

    @action(detail=False, methods=['get'])
    def by_user(self, request):
        user_id = request.query_params.get('user_id')
        if user_id is not None:
            submissions = self.queryset.filter(user_id=user_id)
            serializer = self.get_serializer(submissions, many=True)
            return Response(serializer.data)
        return Response({"detail": "user_id query parameter is required."}, status=HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def by_question(self, request):
        question_id = request.query_params.get('question_id')
        if question_id is not None:
            submissions = self.queryset.filter(question_id=question_id)
            serializer = self.get_serializer(submissions, many=True)
            return Response(serializer.data)
        return Response({"detail": "question_id query parameter is required."}, status=HTTP_400_BAD_REQUEST)
