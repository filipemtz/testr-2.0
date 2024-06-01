
from django.contrib import admin

# Register your models here.
from .models.course import Course
from .models.section import Section
from .models.question import Question

admin.site.register(Course)
admin.site.register(Section)
admin.site.register(Question)
