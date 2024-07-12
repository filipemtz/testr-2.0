import { Component, ElementRef, ViewChild, OnInit, TemplateRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CourseService } from '../../services/course.service';
import { Router, RouterModule } from '@angular/router';
import { Course } from '../../interfaces/course';
import Notify from 'simple-notify'
import 'simple-notify/dist/simple-notify.css'
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
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
  user: any;
  myNotify: any;

  defaultCourse: Course = {
    id: -1,
    url: "",
    name: "Novo Curso",
    visible: true,
    teachers: [],
    originalName: "Novo Curso"
  }
  
  baseCourse: Course = {
    name: "",
    visible: true,
    teachers: [],
    isEditing: false,
    id: -1,
    url: '',
    originalName: "",
  };

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    config: NgbModalConfig,
    private modalService: NgbModal,
    private fb: FormBuilder,
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
    });
    this.addForm = this.fb.group({
      name: ['', Validators.required],
    });

    config.backdrop = 'static';
		config.keyboard = false;
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
        this.courses = response.results;
      },
      error: (err) => {
        console.log(err);
        this.pushNotify('Error', 'Failed to load courses', 'error');
      },
    });
  }

  openDeleteModal(course: Course, content: TemplateRef<any>) {
    this.courseToDelete = course;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  confirmAdd(): void {
    if (this.addForm.valid) {
      this.baseCourse.teachers.push(this.user.id);
      const newCourse = { ...this.baseCourse, ...this.addForm.value };
      console.log(newCourse);
      this.courseService.createCourse(newCourse).subscribe({
        next: (course) => {
          this.addForm.reset();
          this.baseCourse.teachers = [];
          this.courses.push(course);
          this.modalService.dismissAll();
          this.pushNotify('Success', 'Course added successfully', 'success');
        },
        error: (err) => {
          console.error(err);
          this.pushNotify('Error', 'Failed to add course', 'error');
        },
      });
    } else {
      console.log('invalid form');
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
          this.pushNotify('Success', 'Course deleted successfully', 'success');
        },
        error: (err) => {
          console.error(err);
          this.pushNotify('Error', 'Failed to delete course', 'error');
        },
      });
    }
  }

  enableEdit(course: Course) {
    course.isEditing = true;
    course.originalName = course.name;
    setTimeout(() => {
      this.courseInput.nativeElement.focus();
    });
  }

  confirmEditInline(course: Course) {
      const updatedCourse = { ...course };
      this.courseService.updateCourse(course.url, updatedCourse).subscribe({
        next: () => {
          course.isEditing = false;
          this.pushNotify('Success', 'Course updated successfully', 'success');
        },
        error: (err) => {
          console.error(err);
          this.pushNotify('Error', 'Failed to update course', 'error');
        },
      });
    }

  cancelEdit(course: Course) {
    course.isEditing = false;
    course.name = course.originalName;
  }

  resetAddForm(): void{
    this.addForm.reset();
  }

  pushNotify(title: string, text: string | undefined, status: any) {
    this.myNotify = new Notify({
      status: status,
      title: title,
      text: text,
      effect: 'slide',
      type: 'filled'
    })
  }

  createDefaultCourse(userId: string): void {
    const defaultCourse: Course = { ...this.defaultCourse}
    defaultCourse.teachers.push(userId);
    this.courseService.createCourse(defaultCourse).subscribe({
      next: course => {
        this.courses.push(course);
      }
    })
  }

  @HostListener('window:keydown', ['$event'])
  keyEventListener(event: KeyboardEvent): void {
    const editingCourse = this.courses.find(course => course.isEditing);
    if (editingCourse){
      if (event.key === 'Escape' || event.key === 'Esc') {
        this.cancelEdit(editingCourse);
      }
      else if(event.key === 'Enter'){
        this.confirmEditInline(editingCourse);
      }
    }
  }
  
  close() {
    this.myNotify.close()
  }
}
