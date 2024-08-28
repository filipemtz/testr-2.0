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
  isProfessor: boolean = false;
  teacherList: any[] = [];

  defaultCourse: Course = {
    id: -1,
    url: "",
    name: "Novo Curso",
    visible: true,
    teachers: [],
    originalName: "Novo Curso"
  } 

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

        this.authService.userInfo().subscribe({
          next: (response: any) => {
            this.isProfessor = response.groups.includes('teacher');
          },
        });

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
        this.pushNotify('Erro!', 'Erro ao carregar os cursos', 'error');
      },
    });
    //console.log(this.teacherList);
    this.teacherList = [];
  }

  openDeleteModal(course: Course, content: TemplateRef<any>) {
    this.courseToDelete = course;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
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
          this.pushNotify('Erro!', 'Falha ao deletar curso', 'error');
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
        },
        error: (err) => {
          console.error(err);
          this.pushNotify('Erro!', 'Falha ao atualizar curso', 'error');
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
