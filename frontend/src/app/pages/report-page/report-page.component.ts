import { Component } from '@angular/core';
import { Course } from '../../interfaces/course';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { CommonModule } from '@angular/common';
import Notify from 'simple-notify';
import 'simple-notify/dist/simple-notify.css';
import { AdminService } from '../../services/admin.service';

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

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private router: Router,
    private adminService: AdminService,
  ){}

  ngOnInit(): void {
    this.loadCourse();
    this.loadStudents();
  }

    loadStudents(){
    this.adminService.getUsers().subscribe({
      next: response => {
        console.log("RECEBA");
        console.log(response.results);
        const allUsers = response.results;

        const courseStudents = this.course.students;
        console.log(courseStudents);
        if (courseStudents) {
          const enrolledStudents = allUsers.filter((student: any) => 
            courseStudents.includes(student.id) // Converte o ID para string para comparar
          );
          this.enrolledStudents = enrolledStudents;
        }
      }
    })
  }

  loadCourse() {
    const id = this.route.snapshot.paramMap.get('id');
    id && this.courseService.getCourse(+id).subscribe({
      // id && é uma maneira simplificada de fazer if (id) { ... }, maneiro
      next: (response) => {
        this.course = response;
        // this.loadSections(this.course.id);
      },
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
        console.log('Upload successful:', response);
        console.log(response);
        this.loadCourse();
        this.loadStudents();
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
