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
import { Observable } from 'rxjs';

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
  editForm: FormGroup;

  questionToDelete: Question | null = null;
  selectedQuestion: Question | null = null;

  sectionToDelete: Section | null = null;
  selectedSection: Section | null = null;

  baseQuestion: Question = {
    section: -1,
    name: '',
    description: '',
    language: 'PT',
    memory_limit: 0,
    time_limit_seconds: 0,
    cpu_limit: 0,
    submission_deadline: new Date().toISOString(),
    id: -1,
    url: ''
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
  }

  // Recupera um array de questões de um determinada seção
  loadQuestions(sectionId: number) : Question[] {
    this.sectionService.getQuestions(sectionId).subscribe({
      next: (response : any) => {
        console.log(response);
        return response as Question[];
      }
    });
    return [];
  }

  // Recupera um array de seções de um determinado curso
  loadSections(courseId : number){
    this.courseService.getSections(courseId).subscribe({
      next: (response : any) => {
        console.log(response);
        this.sections = response;
        this.sections.forEach((element: Section) => {
          console.log(element)
          element.questions = this.loadQuestions(element.id);
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

  // openDeleteQuestionModal(question: Question, content: TemplateRef<any>) {
  //   this.questionToDelete = question;
  //   this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  // }

 
  

  // openAddQuestionModal(section: Section, content: TemplateRef<any>) {
  //   this.baseQuestion.section = section.id ?? -1;
  //   this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  // }



  // confirmAddQuestion(): void {
  //   if (this.addQuestionForm.valid) {
  //     const newQuestion: Question = { ...this.baseQuestion, ...this.addQuestionForm.value };

  //     this.questionService.postQuestion(newQuestion).subscribe({
  //       next: (question: Question) => {
  //         this.addQuestionForm.reset();
  //         this.questions.push(question);
  //         this.modalService.dismissAll();
  //       },
  //       error: err => {
  //         console.error(err);
  //       }
  //     });
  //   } else {
  //     console.log("invalid form");
  //   }
  // }

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

  confirmEditSection(section: Section) {
    const updatedSection = { ...section, name: section.name };
    this.sectionService.editSection(section.url, updatedSection).subscribe({
      next: () => {
        section.isEditing = false;
      },
    });
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
        this.cdr.detectChanges();
      },
    });
  }

  // confirmDelete(): void {
  //   if (this.questionToDelete && this.questionToDelete.url) {
  //     this.questionService.deleteQuestion(this.questionToDelete.url).subscribe({
  //       next: () => {
  //         this.questions = this.questions.filter(question => question.url !== this.questionToDelete!.url);
  //         this.modalService.dismissAll();
  //       },
  //       error: err => {
  //         console.error(err);
  //       }
  //     });
  //   }
  // }

  

  // confirmSaveSection(): void {
  //   if (this.editForm.valid && this.selectedSection && this.selectedSection.url) {
  //     const updatedSection = { ...this.selectedSection, ...this.editForm.value };

  //     this.sectionService.editSection(this.selectedSection!.url, updatedSection).subscribe({
  //       next: () => {
  //         this.editForm.reset();
  //         this.modalService.dismissAll();
  //         this.selectedSection = null;
  //         this.courseSections = this.courseSections.map(section => section.url === updatedSection.url ? updatedSection : section);
  //       },
  //       error: err => {
  //         console.error(err);
  //       }
  //     });
  //   }
  // }

  // hasQuestionWithSectionUrl(id: number): boolean {
  //   const sectionId = this.courseSections[id].id;
  //   return this.questions.some(question => question.section === sectionId);
  // }

  
}
