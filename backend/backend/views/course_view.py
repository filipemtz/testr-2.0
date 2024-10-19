from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.authentication import SessionAuthentication
from ..models.course import Course
from ..models.question import Question
from rest_framework.views import APIView

from rest_framework.authentication import TokenAuthentication
from accounts.permissions import IsTeacher, ReadOnly
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

from accounts.serializers import UserRegisterSerializer, UserSerializer
from ..serializers.course_serializer import CourseSerializer
from ..serializers.section_serializer import SectionSerializer
import csv


class CourseViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsTeacher | ReadOnly] 
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    
    @action(detail=True, methods=['get'])
    def sections(self, request, pk=None):
        """
        Retrieve all sections associated with a specific course.
        """
        course = self.get_object()
        sections = course.section_set.all()
        serializer = SectionSerializer(sections, many=True, context={'request': request})
        return Response(serializer.data)

    
    # exibe apenas os cursos aos quais o usuario está relacionado. Além de permitir que o professor edite apenas os cursos que ele leciona
    def get_queryset(self):
        user = self.request.user
        return (Course.objects.filter(teachers=user) | Course.objects.filter(students=user)).distinct()
    
class CourseRegisterStudentsAPIView(APIView):
    permission_classes = [IsTeacher]
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    
    def post(self, request, course_id=None):
        course = Course.objects.get(pk=course_id)
        
        csv_file = request.FILES['file']
        decoded_file = csv_file.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file, delimiter=';')

        responses = []

        for row in reader:
            data = {
                'username': row['username'],
                'password': row['password'],
                'password_confirm': row['password'], 
                'email': row['email'],
                'first_name': row['first_name'],
                'last_name': row['last_name'],
                'group': 'student'
            }

            print(data)
            user = User.objects.filter(username=row['username']).first()
            if user:
                if not course.students.filter(id=user.id).exists():
                    course.students.add(user)
                    responses.append({
                        'message': f"User {user.username} already exists and was added to the course.",
                        'user': UserSerializer(user).data
                    })
                else:
                    responses.append({
                        'message': f"User {user.username} already exists and is already in the course.",
                        'user': UserSerializer(user).data
                    })
            else:
                serializer = UserRegisterSerializer(data=data)
                if serializer.is_valid():
                    serializer.save()

                    user = serializer.instance

                    user.first_name = row['first_name']
                    user.last_name = row['last_name']
                    user.save()

                    token, created = Token.objects.get_or_create(user=user)
                    course.students.add(user)
                    print(user)
                    print(UserSerializer(user).data)
                    print()
                    responses.append({
                        'token': token.key, 
                        'user': UserSerializer(user).data
                    })
                else:
                    responses.append({
                        'error': serializer.errors,
                        'data': data
                    })

        return Response(responses)


class CourseReportAPIView(APIView):
    """
    Relatório por turma mostrando para cada aluno quantas questões foram resolvidas (submissão existe e o status é sucesso),
    quantas foram tentadas (submissão existe) e quantas não foram tentadas (submissão não existe).
    """
    permission_classes = [IsTeacher]
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    def get(self, request, course_id=None):
        course = Course.objects.get(pk=course_id)
        students = course.students.all()

        data = []
        for student in students:
            solved = 0
            tried = 0
            not_tried = 0
            
            questions = Question.objects.filter(section__course=course)
            for question in questions:
                sub = question.submission_set.filter(student=student).first()
                if sub:
                    if sub.status == 'SC':
                        solved += 1
                    tried += 1
                else:
                    not_tried += 1

            data.append({
                'student': UserSerializer(student).data,
                'solved': solved,
                'tried': tried,
                'not_tried': not_tried
            })

        return Response(data)