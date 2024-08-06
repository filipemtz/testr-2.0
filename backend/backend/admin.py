
from django.contrib import admin

# Register your models here.
from .models.course import Course
from .models.section import Section
from .models.question import Question
from .models.input_output import InputOutput
from .models.question_file import QuestionFile
from .models.submission import Submission
admin.site.register(Course)
admin.site.register(Section)
admin.site.register(Question)
admin.site.register(InputOutput)
admin.site.register(QuestionFile)
admin.site.register(Submission)
