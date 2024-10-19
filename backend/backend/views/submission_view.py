from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Submission, Question, SubmissionStatus
from ..serializers import SubmissionSerializer
from rest_framework.status import HTTP_400_BAD_REQUEST
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.views import APIView
from django.utils import timezone
from django.contrib.auth.models import User
from accounts.permissions import IsTeacher

class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes=[IsAuthenticated]
    authentication_classes = [SessionAuthentication, TokenAuthentication]


class GetSubmissionAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication, TokenAuthentication]

    def get(self, request):
        print('chegei aqui')
        student = request.user
        question_id = request.query_params.get('question_id')

        if not question_id:
            return Response({"detail": "question_id query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            return Response({"detail": "Question not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            submission = Submission.objects.get(question=question, student=student)
        except Submission.DoesNotExist:
            return Response({"detail": "Submission not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response(SubmissionSerializer(submission).data)
    
    
class AddSubmissionAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication, TokenAuthentication]

    def post(self, request):
        student = request.user
        question_id = request.data.get('question')
        file = request.data.get('file')
        file_name = request.data.get('file_name')
        
        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            return Response({"detail": "Question not found."}, status=status.HTTP_404_NOT_FOUND)

        # Procurar por submissão existente
        submission = Submission.objects.filter(question=question, student=student).first()

        if submission:
            if submission.file:
                submission.file.delete()
            # Atualizar submissão existente
            serializer = SubmissionSerializer(submission, data={
                'file': file,
                'file_name': file_name,
                'created_at': timezone.now()
            }, partial=True)
            status_code = status.HTTP_200_OK
        else:
            # Criar nova submissão
            serializer = SubmissionSerializer(data={
                'question': question_id,
                'student': student.id,
                'file': file,
                'file_name': file_name
            })
            status_code = status.HTTP_201_CREATED

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status_code)
        


class ResetStatusSubmissionAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication, TokenAuthentication]

    def post(self, request):
        student = request.user
        question_id = request.query_params.get('question_id')

        if not question_id:
            return Response({"detail": "question_id query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            return Response({"detail": "Question not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            submission = Submission.objects.get(question=question, student=student)
        except Submission.DoesNotExist:
            return Response({"detail": "Submission not found."}, status=status.HTTP_404_NOT_FOUND)

        submission.status = SubmissionStatus.WAITING_EVALUATION
        submission.save()

        return Response(SubmissionSerializer(submission).data)
    
    
    
class GetAllStudentsSubmissionsAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication, TokenAuthentication]

    def get(self, request):
        question_id = request.query_params.get('question_id')
        
        if not question_id:
            return Response({"detail": "question_id query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            return Response({"detail": "Question not found."}, status=status.HTTP_404_NOT_FOUND)
        
        
        submissions = Submission.objects.filter(question=question)
        
        # retornar os username e status e o arquivo
        data = []
        for submission in submissions:
            data.append({
                'username': submission.student.username,
                'status': submission.status,
                'file': submission.file.url,
                'file_name': submission.file_name
            })
            
        return Response(data)
        
        
class ResetSubmitionForAllStudentsAPIView(APIView):
    permission_classes = [IsTeacher]
    authentication_classes = [SessionAuthentication, TokenAuthentication]

    def post(self, request):
        question_id = request.query_params.get('question_id')
        
        if not question_id:
            return Response({"detail": "question_id query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            return Response({"detail": "Question not found."}, status=status.HTTP_404_NOT_FOUND)
        
        submissions = Submission.objects.filter(question=question)
        
        for submission in submissions:
            submission.status = SubmissionStatus.WAITING_EVALUATION
            submission.save()
        
        return Response({"detail": "Submissions reseted."})
        
       
       
         