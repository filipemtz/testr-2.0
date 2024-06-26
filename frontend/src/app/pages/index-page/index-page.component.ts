import { Component, ElementRef, ViewChild, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CourseService } from '../../services/course.service';
import { Router, RouterModule } from '@angular/router';
import { Course } from '../../interfaces/course';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-index-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './index-page.component.html',
  styleUrls: ['./index-page.component.css'],
})

export class IndexPageComponent implements OnInit {
  @ViewChild('courseInput') courseInput!: ElementRef;
  editForm: FormGroup;
  addForm: FormGroup;

  courses: Course[] = [];
  courseToDelete: Course | null = null;
  selectedCourse: Course | null = null;
  user: any;

  newCourseName: string = '';
  addingCourse = false;
  
  baseCourse: Course = {
    name: "",
    visible: true,
    teachers: [],
    isEditing: false,
    id: -1,
    url: ''
  };

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private router: Router,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private elementRef: ElementRef,
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
    });
    this.addForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.authService.profile().subscribe({
      next: (response) => {
        this.user = response;
        this.loadCourses();
      },
    });
  }

  loadCourses() {
    this.courseService.getCourses().subscribe({
      next: (response) => {
        console.log(response);
        this.courses = response.results;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  openDeleteModal(course: Course, content: TemplateRef<any>) {
    this.courseToDelete = course;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  openAddModal(content: TemplateRef<any>) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  openEditModal(course: Course, content: TemplateRef<any>) {
    this.selectedCourse = course;
    this.editForm.patchValue(course);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  confirmAdd(): void {
    if (this.addForm.valid) {
      this.baseCourse.teachers.push(this.user.id);
      const newCourse = { ...this.baseCourse, ...this.addForm.value };

      this.courseService.createCourse(newCourse).subscribe({
        next: (course) => {
          this.addForm.reset();
          this.baseCourse.teachers = [];
          this.courses.push(course);
          this.modalService.dismissAll();
        },
        error: (err) => {
          console.error(err);
        },
      });
    } else {
      console.log('invalid form');
    }
  }

  confirmSave(): void {
    if (this.editForm.valid && this.selectedCourse && this.selectedCourse.url) {
      const updatedCourse = { ...this.selectedCourse, ...this.editForm.value };

      this.courseService.updateCourse(this.selectedCourse!.url, updatedCourse).subscribe({
        next: () => {
          this.resetForm();
          this.courses = this.courses.map((course) =>
            course.url === updatedCourse.url ? updatedCourse : course,
          );
        },
        error: (err) => {
          console.error(err);
        },
      });
    }
  }

  confirmDelete(): void {
    if (this.courseToDelete && this.courseToDelete.url) {
      this.courseService.deleteCourse(this.courseToDelete.url).subscribe({
        next: () => {
          this.courses = this.courses.filter(
            (course) => course.url !== this.courseToDelete!.url,
          );
          this.modalService.dismissAll();
        },
        error: (err) => {
          console.error(err);
        },
      });
    }
  }

  enableEdit(course: Course) {
    this.selectedCourse = course;
    course.isEditing = true;
    setTimeout(() => {
      this.courseInput.nativeElement.focus();
    });
  }

  confirmEdit(course: Course) {
    if (this.selectedCourse && this.selectedCourse.url) {
      const updatedCourse = { ...this.selectedCourse, name: course.name };

      this.courseService.updateCourse(this.selectedCourse.url, updatedCourse).subscribe({
        next: () => {
          course.isEditing = false;
          this.loadCourses();
        },
        error: (err) => {
          console.error(err);
        },
      });
    }
  }

  cancelEdit(course: Course) {
    course.isEditing = false;
    this.loadCourses();
  }

  enableAdd(){
    this.addingCourse = true;
  }

  addCourse() {
    if(this.newCourseName.trim()) {
      const newCourse = { ...this.baseCourse, name: this.newCourseName, teachers: [this.user.url] };
      this.courseService.createCourse(newCourse).subscribe({
        next: course => {
          this.courses.push(course);
          this.newCourseName = '';
          this.addingCourse = false;
        },
        error: err => {
          console.error(err);
        }
      });
    } 
    else {
      console.log('Course name is required.');
    }
  }

  cancelAdd() {
    this.addingCourse = false;
    this.loadCourses();
  }


  resetForm(): void {
    this.selectedCourse = null;
    this.editForm.reset();
    this.modalService.dismissAll();
  }
}
