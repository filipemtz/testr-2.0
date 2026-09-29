import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Course } from '../../models/course';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { QuestionService } from '../../services/question.service';
import { CommonModule } from '@angular/common';
import { notify_error, notify_success } from '../../utils/notifications';

import {
    ButtonCloseDirective,
    ButtonDirective,
    ModalBodyComponent,
    ModalComponent,
    ModalFooterComponent,
    ModalHeaderComponent,
    ModalTitleDirective
} from '@coreui/angular';


@Component({
    selector: 'app-report-page',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ModalComponent,
        ModalHeaderComponent,
        ModalTitleDirective,
        ButtonCloseDirective,
        ModalBodyComponent,
        ModalFooterComponent,
        ButtonDirective,
    ],
    templateUrl: './report-page.component.html',
    styleUrl: './report-page.component.css'
})

export class ReportPageComponent {

    course: Course = {} as Course;
    selectedFile: File | null = null;
    selectedQuestionJsonFile: File | null = null;

    enrolledStudents: any[] = [];
    report: any;
    teachers: any;
    loading: boolean = false;
    jsonModalVisible: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private courseService: CourseService,
        private questionService: QuestionService,
    ) { }

    ngOnInit(): void {
        this.loadCourse();
    }

    loadCourse() {
        const id = this.route.snapshot.paramMap.get('id');
        id && this.courseService.getCourse(+id).subscribe({
            // id && é uma maneira simplificada de fazer if (id) { ... }, maneiro
            next: (response) => {
                this.course = response;
                this.loadReport();
                this.loadCourseTeachers();
                // this.loadSections(this.course.id);
            },
        });
    }

    loadReport() {
        this.courseService.getReport(this.course.id).subscribe({
            next: (response) => {
                this.report = response;
            },
        });
    }

    loadCourseTeachers() {
        this.courseService.getCourseTeachers(this.course.id).subscribe({
            next: (response) => {
                this.teachers = response;
            },
        });
    }

    removeTeacher(id: number) {
        if (this.course.teachers.length <= 1) {
            notify_error('Todo curso deve ter pelo menos um professor!');
            return;
        }
        this.courseService.removeTeacher(this.course.id, id).subscribe({
            next: () => {
                this.loadCourseTeachers();
            },
            error: (error) => {
                notify_error('Problema ao remover o professor!');
            }
        });
    }

    addTeacher(username: string) {
        if (username.length < 1) {
            notify_error('Barra de pesquisa vazia! Digite o nome do professor');
            return;
        }
        this.courseService.addTeacher(this.course.id, username).subscribe({
            next: () => {
                this.loadCourseTeachers();
            },
            error: (error) => {
                notify_error(error.error.error);
            },
        })
    }

    addStudent(username: string) {
        if (username.length < 1) {
            notify_error('Barra de pesquisa vazia! Digite o nome do aluno');
            return;
        }
        this.courseService.addStudent(this.course.id, username).subscribe({
            next: (response) => {
                this.loadReport();
                let mensagem = "Aluno adicionado com sucesso!";
                if (response?.message) {
                    mensagem = response.message;
                }
                notify_success(mensagem);
            },
            error: (error) => {
                let mensagem = "Erro ao adicionar aluno!";
                if (error.error?.error) {
                    mensagem = error.error.error;
                }
                notify_error(mensagem);
            }
        })
    }

    uploadCSV() {
        if (!this.selectedFile) {
            notify_error('Selecione um arquivo csv!');
            return;
        }

        const formData = new FormData();
        formData.append('file', this.selectedFile, this.selectedFile.name);
        this.loading = true;
        this.courseService.registerStudentsCSV(formData, this.course.id).subscribe({
            next: (response: { message?: string, details?: string }) => {
                this.loadCourse();
                this.loadReport();

                let mensagem = "Upload de arquivo realizado com sucesso!";
                if (response?.message) {
                    mensagem = response.message;
                }

                notify_success(mensagem);
                this.loading = false;
            },
            error: err => {
                let mensagem = "Upload de arquivo falhou!";
                let detalhes = "";
                if (err.error?.message) {
                    mensagem = err.error.message; // Exibe o resumo de erros do backend
                }

                if (Array.isArray(err.error?.details) && err.error.details.length > 0) {
                    detalhes = err.error.details.join('\n');
                }

                if (detalhes) {
                    notify_error(detalhes);
                }

                notify_error(mensagem);
                this.loading = false;
            },
        });
    }

    uploadJsonQuestions() {
        if (!this.selectedQuestionJsonFile) {
            notify_error('Selecione um arquivo!');
            return;
        }

        const formData = new FormData();
        formData.append('file', this.selectedQuestionJsonFile);
        formData.append('file_name', this.selectedQuestionJsonFile.name);
        formData.append('course_id', this.course.id.toString());

        this.questionService.importQuestionsFromJson(formData).subscribe({
            next: (response) => {
                console.log('HTTP SUCCESS', response);
                notify_success('Upload com sucesso das questões!');
            },
            error: (err: any) => {
                notify_error('Erro ao carregar questões!');
            },
        });
    }

    unrollStudent(course: Course, student: any, student_idx: number) {
        this.courseService.unrollStudent(course.id, student.id).subscribe({
            next: (response: any) => {
                this.report.splice(student_idx, 1);
                notify_success("Estudante removido.");
            },
            error: err => {
                notify_error("Falha ao remover estudante.");
            },
        });
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
        }
    }

    onQuestionJsonSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedQuestionJsonFile = input.files[0];
        }
    }
}
