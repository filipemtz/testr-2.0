import { Component } from '@angular/core';
import { Course } from '../../models/course';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { CommonModule } from '@angular/common';
import Notify from 'simple-notify';
import 'simple-notify/dist/simple-notify.css';

@Component({
  selector: 'app-report-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule],
  templateUrl: './report-page.component.html',
  styleUrl: './report-page.component.css'
})

export class ReportPageComponent {

  course: Course = {} as Course;
  selectedFile: File | null = null;

  myNotify: any;
  enrolledStudents: any[] = [];
  report: any;
  teachers: any;
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
  ){}

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

  loadReport(){
    this.courseService.getReport(this.course.id).subscribe({
      next: (response) => {
        this.report = response;
      },
    });
  }

  loadCourseTeachers(){
    this.courseService.getCourseTeachers(this.course.id).subscribe({
      next: (response) => {
        this.teachers = response;
      },
    });
  }

  removeTeacher(id : number){
    if(this.course.teachers.length <= 1){
      this.pushNotify('Erro!', 'Todo curso deve ter pelo menos um professor!', 'error');
      return;
    }
    this.courseService.removeTeacher(this.course.id, id).subscribe({
      next: () => {
        this.loadCourseTeachers();
      },
      error: (error) => {
        this.pushNotify('Erro!', 'Problema ao remover o professor!', 'error');
      }
    });
  }

  addTeacher(username: string){
    if(username.length < 1){
      this.pushNotify('Erro!', 'Barra de pesquisa vazia! Digite o nome do professor', 'error');
      return;
    }
    this.courseService.addTeacher(this.course.id, username).subscribe({
      next: () =>{
        this.loadCourseTeachers();
      },
      error: (error) => {
        this.pushNotify('Erro!', error.error.error, 'error');
      },
    })
  }

  addStudent(username: string){
    if(username.length < 1){
      this.pushNotify('Erro!', 'Barra de pesquisa vazia! Digite o nome do aluno', 'error');
      return;
    }
    this.courseService.addStudent(this.course.id, username).subscribe({
      next: (response) =>{
        this.loadReport();
        let mensagem = "Aluno adicionado com sucesso!";
        if (response?.message) {
          mensagem = response.message;
        }
        this.pushNotify('Sucesso!', mensagem, 'success');
      },
      error: (error) => {
        let mensagem = "Erro ao adicionar aluno!";
        if (error.error?.error) {
          mensagem = error.error.error;
        }
        this.pushNotify('Erro!', mensagem, 'error');
      }
    })
  }

  uploadCSV() {
    if (!this.selectedFile) {
      this.pushNotify('Erro!', 'Selecione um arquivo csv!', 'warning');
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

        this.pushNotify('Sucesso!', mensagem, 'success');
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
          this.pushNotify('Detalhes:', detalhes, 'error');
        }

        this.pushNotify('Erro!', mensagem, 'error');
        this.loading = false;
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  pushNotify(title: string, text: string | undefined, status: any) {
    this.myNotify = new Notify({
      status: status,
      title: title,
      text: text,
      effect: 'slide',
      type: 'filled',
      speed: 1500,
    });
  }


}
