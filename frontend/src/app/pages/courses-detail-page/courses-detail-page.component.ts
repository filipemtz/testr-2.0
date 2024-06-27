import { Component, OnInit, TemplateRef, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Course } from '../../interfaces/course';
import { Section } from '../../interfaces/section';
import { Question } from '../../interfaces/question';
import { CommonModule } from '@angular/common';
import { QuestionService } from '../../services/question.service';
import { SectionService } from '../../services/section.service';
import { CourseService } from '../../services/course.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
  questions: Question[] = [] as Question[];

  courseSections: Section[] = [] as Section[];
  sectionQuestions: Question[] = [] as Question[];
 
  addSectionForm: FormGroup;
  addQuestionForm: FormGroup;
  editForm: FormGroup;

  idx: number = 1;
  cont: number = 0;

  questionToDelete: Question | null = null;
  selectedQuestion: Question | null = null;

  sectionToDelete: Section | null = null;
  selectedSection: Section | null = null;

  baseSection: Section = {
    name: "",
    course: -1,
    url: "",
    id: -1
  };

  baseQuestion: Question = {
    section: -1,
    name: '',
    description: '',
    language: 'PT',
    memory_limit: 0,
    time_limit_seconds: 0,
    cpu_limit: 0,
    submission_deadline: new Date().toISOString()
  };

  constructor(
    private route: ActivatedRoute,
    private questionService: QuestionService,
    private sectionService: SectionService,
    private courseService: CourseService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required]
    });

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
  }

  ngOnInit(): void {
    this.loadCourse();
    this.loadQuestions();
  }

  loadCourseSections(){
    this.courseService.getSections(this.course.id ?? -1).subscribe({
      next: (response : any) => {
        this.courseSections = response;
      }
    })
  }

  loadSectionQuestions(id: number){
    this.sectionService.getQuestions(id).subscribe({
      next: (response : any) => {
        console.log(response);
        this.sectionQuestions = response;
      }
    })
  }

  loadCourse() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.courseService.getCourse(id).subscribe({
        next: response => {
          this.course = response;
          this.loadCourseSections();
          this.cdr.detectChanges();
        },
        error: err => {
          console.log(err);
        }
      });
    });
  }

  loadQuestions() {
    this.questionService.getQuestions().subscribe({
      next: (response: { results: Question[] }) => {
        this.questions = response.results;
      },
      error: err => {
        console.log(err);
      }
    });
  }

  openDeleteQuestionModal(question: Question, content: TemplateRef<any>) {
    this.questionToDelete = question;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  openDeleteSectionModal(section: Section, content: TemplateRef<any>) {
    this.sectionToDelete = section;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  openAddSectionModal(course: Course, content: TemplateRef<any>) {
    this.baseSection.course = course.id ?? -1;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  openAddQuestionModal(section: Section, content: TemplateRef<any>) {
    this.baseQuestion.section = section.id ?? -1;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  openEditSectionModal(section: Section, content: TemplateRef<any>) {
    this.selectedSection = section;
    this.editForm.patchValue(section);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  confirmAddQuestion(): void {
    if (this.addQuestionForm.valid) {
      const newQuestion: Question = { ...this.baseQuestion, ...this.addQuestionForm.value };

      this.questionService.postQuestion(newQuestion).subscribe({
        next: (question: Question) => {
          this.addQuestionForm.reset();
          this.questions.push(question);
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

  confirmAddSection(): void {
    if (this.addSectionForm.valid) {
      const newSection: Section = { ...this.baseSection, ...this.addSectionForm.value };

      this.sectionService.postSection(newSection).subscribe({
        next: section => {
          this.addSectionForm.reset();
          this.courseSections.push(section);
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

  confirmDelete(): void {
    if (this.questionToDelete && this.questionToDelete.url) {
      this.questionService.deleteQuestion(this.questionToDelete.url).subscribe({
        next: () => {
          this.questions = this.questions.filter(question => question.url !== this.questionToDelete!.url);
          this.modalService.dismissAll();
        },
        error: err => {
          console.error(err);
        }
      });
    }
  }

  confirmDeleteSection(): void {
    if (this.sectionToDelete && this.sectionToDelete.url) {
      this.sectionService.deleteSection(this.sectionToDelete.url).subscribe({
        next: () => {
          this.courseSections = this.courseSections.filter(section => section.url !== this.sectionToDelete!.url);
          this.modalService.dismissAll();
          this.cdr.detectChanges();
        },
        error: err => {
          console.error(err);
        }
      });
    }
  }

  confirmSaveSection(): void {
    if (this.editForm.valid && this.selectedSection && this.selectedSection.url) {
      const updatedSection = { ...this.selectedSection, ...this.editForm.value };

      this.sectionService.editSection(this.selectedSection!.url, updatedSection).subscribe({
        next: () => {
          this.editForm.reset();
          this.modalService.dismissAll();
          this.selectedSection = null;
          this.courseSections = this.courseSections.map(section => section.url === updatedSection.url ? updatedSection : section);
        },
        error: err => {
          console.error(err);
        }
      });
    }
  }

  hasQuestionWithSectionUrl(id: number): boolean {
    const sectionId = this.courseSections[id].id;
    return this.questions.some(question => question.section === sectionId);
  }

  reset_idx() {
    this.idx = 1;
  }

  inc_idx() {
    this.idx += 1;
  }

  reset_cont() {
    this.cont = 0;
  }

  inc_cont() {
    this.cont += 1;
  }

  enableEditSection(section: Section) {
    section.isEditing = true;
    setTimeout(() => {
      this.sectionInput.nativeElement.focus();
    });
  }

  cancelEditSection(section: Section) {
    section.isEditing = false;
    this.loadCourseSections(); // Optionally reload sections to revert changes
  }

  confirmEditSection(section: Section) {
    if (section.url) {
      const updatedSection = { ...section, name: section.name };

      this.sectionService.editSection(section.url, updatedSection).subscribe({
        next: () => {
          section.isEditing = false;
          this.loadCourseSections();
        },
        error: err => {
          console.error(err);
        }
      });
    }
  }
}
