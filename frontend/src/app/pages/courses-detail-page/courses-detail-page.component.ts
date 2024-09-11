import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Course } from '../../interfaces/course';
import { Section } from '../../interfaces/section';
import { Question } from '../../interfaces/question';
import { CommonModule } from '@angular/common';
import { QuestionService } from '../../services/question.service';
import { SectionService } from '../../services/section.service';
import { CourseService } from '../../services/course.service';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { MatIconModule } from '@angular/material/icon';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Notify from 'simple-notify';
import 'simple-notify/dist/simple-notify.css';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-courses-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './courses-detail-page.component.html',
  styleUrls: ['./courses-detail-page.component.css'],
})

export class CoursesDetailPageComponent implements OnInit {
  @ViewChild('sectionInput') sectionInput!: ElementRef;
  course: Course = {} as Course;
  sections: Section[] = [] as Section[];

  addSectionForm: FormGroup;
  addQuestionForm: FormGroup;

  questionToDelete: Question | null = null;
  sectionToDelete: Section | null = null;

  sectionToEdit: Section | null = null;

  selectedFile: File | null = null;

  defaultSection: Section = {
    id: -1,
    url: '',
    name: "Nova Seção",
    course: -1,
    originalName: "Nova Seção"
  }

  defaultQuestion: Question = {
    id: -1,
    url: '',
    name: "Nova Questão",
    description: '',
    language: "PT",
    submission_deadline: new Date(),
    memory_limit: 200,
    time_limit_seconds: 30,
    cpu_limit: 0.25,
    section: -1,
  };

  myNotify: any;
  constructor(
    private route: ActivatedRoute,
    private questionService: QuestionService,
    private sectionService: SectionService,
    private courseService: CourseService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private router: Router,
    config: NgbModalConfig,
    private authService: AuthService,
  ) {
    this.addSectionForm = this.fb.group({
      name: ['', Validators.required],
    });

    this.addQuestionForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      language: ['', Validators.required],
      time_limit_seconds: ['', Validators.required],
      memory_limit: ['', Validators.required],
      cpu_limit: ['', Validators.required],
      submission_deadline: ['', Validators.required],
    });
  
    config.backdrop = 'static';
		config.keyboard = false;
  }
  isProfessor: boolean = false;
  
  ngOnInit(): void {
    this.loadCourse();
    this.authService.userInfo().subscribe({
      next: (response: any) => {
        this.isProfessor = response.groups.includes('teacher');
      },
    });
  }

  // Recupera um array de seções de um determinado curso
  loadSections(courseId: number) {
    this.courseService.getSections(courseId).subscribe({
      next: (response: any) => {
        this.sections = response;
        this.sections.forEach((element: Section) => {
          // Recupera um array de questões de uma determinada seção
          this.sectionService.getQuestions(element.id).subscribe({
            next: (response: any) => {
              element.questions = response;
            },
            error: (err) => {
              console.log(err);
              this.pushNotify('Erro!', 'Erro ao carregar as seções', 'error');
            }
          });
        });
      },
    
    });
  }

  loadCourse() {
    const id = this.route.snapshot.paramMap.get('id');
    id &&
      this.courseService.getCourse(+id).subscribe({
        // id && é uma maneira simplificada de fazer if (id) { ... }, maneiro
        next: (response) => {
          this.course = response;
          this.loadSections(this.course.id);
        },
      });
  }

  confirmAddSection(): void {
    if (this.addSectionForm.valid) {
      const newSection: Section = {
        course: this.course.id,
        ...this.addSectionForm.value,
      };

      this.sectionService.postSection(newSection).subscribe({
        next: (section) => {
          this.addSectionForm.reset();
          this.sections.push(section);
          this.modalService.dismissAll();
        },
        error: (err) => {
          console.error(err);
          this.pushNotify('Erro!', 'Falha ao adicionar uma seção', 'error');
        },
      });
    } else {
      console.log('invalid form');
    }
  }

  openDeleteSectionModal(section: Section, content: TemplateRef<any>) {
    this.sectionToDelete = section;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  confirmDeleteSection(): void {
    this.sectionService
      .deleteSection(this.sectionToDelete?.url ?? '')
      .subscribe({
        next: () => {
          this.sections = this.sections.filter(
            (section) => section.url !== this.sectionToDelete!.url,
          );
          this.modalService.dismissAll();
        },
        error: (err) => {
          console.error(err);
          this.pushNotify('Error!', 'Falha ao deletar uma seção', 'error');
        }
      });
  }

  openDeleteQuestionModal(question: Question, content: TemplateRef<any>) {
    this.questionToDelete = question;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  enableEditSection(section: Section) {
    section.isEditing = true;
    section.originalName = section.name;
    setTimeout(() => {
      this.sectionInput.nativeElement.focus();
    });
  }

  confirmEditSection(section: Section) {
    const updatedSection = { ...section, name: section.name };
    this.sectionService.editSection(section.url, updatedSection).subscribe({
      next: () => {
        section.isEditing = false;
      },
      error: (err) => {
        console.error(err);
        this.pushNotify('Erro!', 'Falha ao editar uma seção', 'error');
      },
    });
  }

  cancelEditSection(section: Section) {
    section.isEditing = false;
    section.name = section.originalName;
  }

  confirmDeleteQuestion(): void {
    this.questionService
      .deleteQuestion(this.questionToDelete?.url ?? '')
      .subscribe({
        next: () => {
          this.sections = this.sections.map((section) => {
            section.questions = section.questions?.filter(
              (question) => question.url !== this.questionToDelete!.url,
            );
            return section;
          });
          this.modalService.dismissAll();
        },
        error: (err) => {
          console.error(err);
          this.pushNotify('Erro!', 'Falha ao deletar uma questão', 'error');
        }
      });
  }

  createDefaultSection(courseId: number){
    const defaultSection: Section = { ...this.defaultSection, course: courseId }
    this.sectionService.postSection(defaultSection).subscribe({
      next: section => {
        this.sections.push(section);
      }
    })
  }

  createDefaultQuestion(sectionId: number){
    const defQuestion: Question = { ...this.defaultQuestion, section: sectionId };
    this.questionService.postQuestion(defQuestion).subscribe({
      next: question => {
        this.router.navigate([`/question/${question.id}/edit`]); 
      },
      error: err => {
        console.error(err);
      }
    });
  }

  @HostListener('window:keydown', ['$event'])
  keyEventListener(event: KeyboardEvent): void {
    const editingSection = this.sections.find(section => section.isEditing);
    if (editingSection){
      if (event.key === 'Escape' || event.key === 'Esc') {
        this.cancelEditSection(editingSection);
      }
      else if(event.key === 'Enter'){
        this.confirmEditSection(editingSection);
      }
    }
  }

  resetAddSectionForm(): void {
    this.addSectionForm.reset();
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
