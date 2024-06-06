import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { Router, RouterModule } from '@angular/router';
import { Course } from '../../interfaces/course';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-index-page',
  standalone: true,
  imports: [ CommonModule, MatIconModule, RouterModule, FormsModule, ReactiveFormsModule ],
  templateUrl: './index-page.component.html',
  styleUrl: './index-page.component.css'  
})
export class IndexPageComponent implements OnInit {
  editForm: FormGroup;
  addForm: FormGroup;

  courses: any[] = [];
  courseToDelete: any;
  selectedCourse: any;
  user: any;
  teachers: any[] = [];

  baseCourse: Course = {
    name: "",
    visible: true,
    teachers: []
  };

  /*export interface Course {
    id: number;
    url: string;
    name: string;
    created_at: string;
    visible: boolean;
}*/
  
  constructor(private authService: AuthService, private apiService: ApiService, private router: Router, 
    private modalService: NgbModal, private fb: FormBuilder) {
      this.editForm = this.fb.group({
        name: ['', Validators.required]      
      });
      this.addForm = this.fb.group({
        name: ['', Validators.required]
      });
   }

  ngOnInit(): void {
    this.authService.profile().subscribe({
      next: response => {
        this.user  = response;
        this.loadCourses();
      },
      error: err => {
        this.router.navigate(['/accounts/login']);
      }
    });
  }

  loadCourses() {
    this.apiService.getCourses().subscribe( {next: response => {
      this.courses = response.results;
    },
    error: err => {
      console.log(err);
    }});
  }

  openDeleteModal(course: any, content: TemplateRef<any>) {
    this.courseToDelete = course;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  openAddModal(course: any, content: TemplateRef<any>) {
    this.courseToDelete = course;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  openEditModal(course: any, content: TemplateRef<any>) {
    this.selectedCourse = course;
    this.editForm.patchValue(course);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  confirmAdd(): void {
    if(this.addForm.valid){

      this.baseCourse.teachers.push(this.user.url);
      const newCourse = {...this.baseCourse, ...this.addForm.value}

      this.apiService.post('courses/', newCourse).subscribe({
        next: course => {
          this.resetForm();
          this.baseCourse.teachers = [];
          this.courses.push(course);
        },
        error: err => {
          console.error(err);
        }});
    }
    else{
      console.log("invalid form");
    }
  }

  confirmSave(): void {
    if (this.editForm.valid) {
      const updatedCourse = { ...this.selectedCourse, ...this.editForm.value };

      this.apiService.edit(this.selectedCourse.url, updatedCourse).subscribe({
        next: () => {
          this.addForm.reset();
          this.courses = this.courses.map(course => course.url === updatedCourse.url ? updatedCourse : course);
        },
        error: err => {
          console.error(err);
        }
      });
    }
  }

  confirmDelete(): void {
    console.log(this.courseToDelete.url)
    this.apiService.delete(this.courseToDelete.url).subscribe({
      next: () => {
        this.courses = this.courses.filter(course => course.url !== this.courseToDelete.url);
        this.modalService.dismissAll();
      },
      error: err => {
        console.error(err);
      }
    });
  }

  // Método para resetar o formulário e limpar o usuário selecionado
  resetForm(): void {
    this.selectedCourse = null;
    this.editForm.reset();
    this.modalService.dismissAll();
  }
}
