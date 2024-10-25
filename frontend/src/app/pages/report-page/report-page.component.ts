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
        console.log(response)
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
    this.courseService.removeTeachers(this.course.id, id).subscribe({
      next: () => {
        this.loadCourseTeachers();
      },
      error: (error) => {
        this.pushNotify('Erro!', 'Problema ao remover o professor!', 'error');
        console.log(error);
      }
    });
  }

  uploadCSV() {
    if (!this.selectedFile) {
      this.pushNotify('Erro!', 'Selecione um arquivo csv!', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    this.courseService.registerStudentsCSV(formData, this.course.id).subscribe({
      next: response => {
        //console.log('Upload successful:', response);
        console.log(response);
        this.loadCourse();
        this.loadReport();
      },
      error: err => {
        console.error('Upload failed:', err);
        this.pushNotify('Erro!', "Upload de arquivo falhou", 'error');
      }
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
    });
  }
}
