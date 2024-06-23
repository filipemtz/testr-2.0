import { Component, OnInit, TemplateRef } from '@angular/core';
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
  editForm: FormGroup;
  addForm: FormGroup;

  courses: Course[] = [];
  courseToDelete: Course | null = null;
  selectedCourse: Course | null = null;
  user: any;

  baseCourse: Course = {
    name: '',
    visible: true,
    teachers: [],
  };

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private router: Router,
    private modalService: NgbModal,
    private fb: FormBuilder,
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
        console.log(this.user);
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

  resetForm(): void {
    this.selectedCourse = null;
    this.editForm.reset();
    this.modalService.dismissAll();
  }
}
