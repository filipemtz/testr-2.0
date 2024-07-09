import { Component, OnInit, TemplateRef, ViewChild, ElementRef } from '@angular/core';
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
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-courses-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, FormsModule, ReactiveFormsModule],
  templateUrl: './courses-detail-page.component.html',
  styleUrls: ['./courses-detail-page.component.css']
})

export class CoursesDetailPageComponent implements OnInit {
  @ViewChild('sectionInput') sectionInput!: ElementRef;
  course: Course = {} as Course;
  sections: Section[] = [] as Section[];

  addSectionForm: FormGroup;
  addQuestionForm: FormGroup;

  questionToDelete: Question | null = null;
  sectionToDelete: Section | null = null;

  selectedSection: Section | null = null;

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

  constructor(
    private route: ActivatedRoute,
    private questionService: QuestionService,
    private sectionService: SectionService,
    private courseService: CourseService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private router: Router,
    config: NgbModalConfig,
  ) {
    this.addSectionForm = this.fb.group({
      name: ['', Validators.required]
    });

    this.addQuestionForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      language: ['', Validators.required],
      time_limit_seconds: ['', Validators.required],
      memory_limit: ['', Validators.required],
      cpu_limit: ['', Validators.required],
      submission_deadline: ['', Validators.required]
    });
  
    config.backdrop = 'static';
		config.keyboard = false;
  }

  ngOnInit(): void {
    this.loadCourse();
  }


  // Recupera um array de seções de um determinado curso
  loadSections(courseId : number){
    this.courseService.getSections(courseId).subscribe({
      next: (response : any) => {
        this.sections = response;
        this.sections.forEach((element: Section) => {
          // Recupera um array de questões de uma determinada seção
          this.sectionService.getQuestions(element.id).subscribe({
            next: (response : any) => {
              element.questions = response;
            }
          });
        });
      }
    })
  }

  loadCourse() {
    const id = this.route.snapshot.paramMap.get('id');
    id && this.courseService.getCourse(+id).subscribe({ // id && é uma maneira simplificada de fazer if (id) { ... }, maneiro
      next: response => {
        this.course = response;
        this.loadSections(this.course.id);
      },
    });
  }

  // Sections
  openAddSectionModal(content: TemplateRef<any>) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  confirmAddSection(): void {
    if (this.addSectionForm.valid) {
      const newSection: Section =  { course: this.course.id, ...this.addSectionForm.value }

      this.sectionService.postSection(newSection).subscribe({
        next: section => {
          this.addSectionForm.reset();
          this.sections.push(section);
          this.modalService.dismissAll();
        },
        error: err => {
          console.error(err);
        }
      });
    } else {
      console.log("invalid form");
    }
  }

  openDeleteSectionModal(section: Section, content: TemplateRef<any>) {
    this.sectionToDelete = section;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  confirmDeleteSection(): void {
    this.sectionService.deleteSection(this.sectionToDelete?.url ?? '').subscribe({
      next: () => {
        this.sections = this.sections.filter(section => section.url !== this.sectionToDelete!.url);
        this.modalService.dismissAll();
      },
    });
  }

  confirmEditQuestion(question: Question) {
    this.questionService.editQuestion(question.url, question).subscribe({
      next: () => {
        question.isEditing = false;
      },
    });
  }

  confirmAddQuestion(): void {
    if (this.addQuestionForm.valid && this.selectedSection) {
      const newQuestion: Question = { section: this.selectedSection.id, ...this.addQuestionForm.value };

      this.questionService.postQuestion(newQuestion).subscribe({
        next: question => {
          this.addQuestionForm.reset();
          this.selectedSection!.questions?.push(question);
          this.modalService.dismissAll();
        },
      });
    } else {
      console.log("invalid form");
    }
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
      },
    });
  }

  cancelEditSection(section: Section) {
    section.isEditing = false;
    section.name = section.originalName;
  }

  confirmDeleteQuestion(): void {
    this.questionService.deleteQuestion(this.questionToDelete?.url ?? '').subscribe({
      next: () => {
        this.sections = this.sections.map(section => {
          section.questions = section.questions?.filter(question => question.url !== this.questionToDelete!.url);
          return section;
        });
        this.modalService.dismissAll();
      },
    });
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

  resetAddSectionForm(): void {
    this.addSectionForm.reset();
  }
}
