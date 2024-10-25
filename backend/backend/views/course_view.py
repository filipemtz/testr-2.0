from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.authentication import SessionAuthentication
from ..models.course import Course
from ..models.question import Question
from ..models.section import Section
from ..models.input_output import InputOutput
from ..models.question_file import QuestionFile

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
    
class CourseRemoveTeacherAPIView(APIView):
    permission_classes = [IsTeacher]
    authentication_classes = [SessionAuthentication, TokenAuthentication]

    def post(self, request, course_id=None):
        course = Course.objects.get(pk=course_id)
        teacher_id = request.data.get('teacher_id')
        
        try:
            teacher = User.objects.get(id=teacher_id)
        except User.DoesNotExist:
            return Response({'error': 'Professor não encontrado.'}, status=404)

        if teacher in course.teachers.all():
            course.teachers.remove(teacher)
            return Response({'message': f'Professor {teacher.username} removido do curso com sucesso.'})
        else:
            return Response({'error': 'Este professor não está associado a este curso.'}, status=400)
        
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
    
class CourseTeachersAPIView(APIView):
    permission_classes = [IsTeacher]
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    def get(self, request, course_id=None):
        course = Course.objects.get(pk=course_id)
        teachers = course.teachers.all()

        data = []
        for t in teachers:
            data.append({
                'teacher': UserSerializer(t).data,
            })

        return Response(data)
    
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
    
# Cria uma cópia de um curso que o professor leciona para um novo curso sem alunos mas com todas as questões, seções e arquivos associados
class CourseCreateCopyAPIView(APIView):
    permission_classes = [IsTeacher]
    authentication_classes = [SessionAuthentication, TokenAuthentication]

    def post(self, request, course_id=None):
        course = Course.objects.get(pk=course_id)

        if not course.teachers.filter(id=request.user.id).exists():
            return Response({'error': 'You do not have permission to copy this course.'}, status=403)

        # Cria o novo curso
        new_course = Course.objects.create(
            name=f"{course.name} - Copy",
        )
        new_course.teachers.add(request.user)

        # Copia seções, questões e arquivos associados
        for section in course.section_set.all():
            new_section = Section.objects.create(
                course=new_course,
                name=section.name,
                created_at=section.created_at
            )

            for question in section.question_set.all():
                new_question = Question.objects.create(
                    section=new_section,
                    name=question.name,
                    description=question.description,
                    language=question.language,
                    time_limit_seconds=question.time_limit_seconds,
                    memory_limit=question.memory_limit,
                    cpu_limit=question.cpu_limit,
                    submission_deadline=question.submission_deadline
                )

                for input_output in question.inputoutput_set.all():
                    InputOutput.objects.create(
                        question=new_question,
                        input=input_output.input,
                        output=input_output.output,
                        visible=input_output.visible
                    )

                for question_file in question.questionfile_set.all():
                    QuestionFile.objects.create(
                        question=new_question,
                        file=question_file.file,
                        file_name=question_file.file_name,
                    )

        # Retorna o novo curso com o contexto da requisição
        serializer = CourseSerializer(new_course, context={'request': request})
        return Response(serializer.data)

    