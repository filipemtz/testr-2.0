import { Component, OnInit, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Course } from '../../interfaces/course';
import { Section } from '../../interfaces/section';
import { Question } from '../../interfaces/question';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {MatIconModule} from '@angular/material/icon';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-courses-detail-page',
  standalone: true,
  imports: [ CommonModule, RouterModule, MatIconModule, FormsModule, ReactiveFormsModule],
  templateUrl: './courses-detail-page.component.html',
  styleUrls: ['./courses-detail-page.component.css']
})
export class CoursesDetailPageComponent implements OnInit {
  course: Course = {} as Course;
  sections: Section[] = [];
  questions: Question[] = [];

  addSectionForm: FormGroup;
  addQuestionForm: FormGroup;
  editForm: FormGroup;
  
  idx: number = 1;
  cont: number = 0;
  cont_question: number = 0;
  currentSectionId: number = -1;
  id: number = -1;

  questionToDelete: any;
  selectedQuestion: any;

  sectionToDelete: any;
  selectedSection: any;

  baseSection: Section = {
    name: "",
    course: ""
  };

  baseQuestion: Question = {
    section: '',
    name: '',
    description: '',
    language: 'PT',
    memory_limit: 0,
    time_limit_seconds: 0,
    cpu_limit: 0,
    submission_deadline: new Date().toISOString()
  }


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService,
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
    this.authService.profile().subscribe( {next: () => {
        // Pegar um curso baseado no id atual da pagina
        this.loadSections();
        this.loadCourse();
        this.loadQuestions();
      },

      error: err => {
        this.router.navigate(['/accounts/login']);
      }
    });
  }

  //Carrega todas as seções
  loadSections() {
    this.apiService.getSections().subscribe( {next: response => {
      this.sections = response.results;
      this.cdr.detectChanges();
    }, 
    error: err => {
      console.log(err);
    }});
  }

  // Carrega o curso da página atual
  loadCourse(){
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.apiService.getCourse(id).subscribe( {next: response => {
        this.course = response;
        this.cdr.detectChanges();
      },
      error: err => {
        console.log(err);
      }});
    });
  }

  //Carrega todas as questões
  loadQuestions() {
    // Pegar as questoes de uma sessão
    this.apiService.getQuestions().subscribe( {next: response => {
      this.questions = response.results;
    },
    error: err => {
      console.log(err);
    }});
  }

  openDeleteQuestionModal(question: any, content: TemplateRef<any>) {
    this.questionToDelete = question;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  openDeleteSectionModal(section: any, content: TemplateRef<any>) {
    this.sectionToDelete = section;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  openAddSectionModal(course: any, content: TemplateRef<any>) {
    this.baseSection.course = course.url;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  openAddQuestionModal(section: any, content: TemplateRef<any>) {
    this.baseQuestion.section = section.url;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  openEditSectionModal(section: any, content: TemplateRef<any>) {
    this.selectedSection = section;
    this.editForm.patchValue(section);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  confirmAddQuestion(): void {
    if (this.addQuestionForm.valid) {
      const newQuestion = {...this.baseQuestion, ...this.addQuestionForm.value};

      console.log(this.baseQuestion);
      console.log(newQuestion);
      console.log(this.addQuestionForm.value);

      this.apiService.post('questions/', newQuestion).subscribe({
        next: question => {
          this.addQuestionForm.reset();
          this.questions.push(question);
          this.modalService.dismissAll();
          this.cdr.detectChanges();
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
    if(this.addSectionForm.valid){
      const newSection = {...this.baseSection, ...this.addSectionForm.value}

      this.apiService.post('sections/', newSection).subscribe({
        next: section => {
          this.addSectionForm.reset();
          this.sections.push(section);
          this.modalService.dismissAll();
          this.cdr.detectChanges();
        },
        error: err => {
          console.error(err);
        }});
    }
    else{
      console.log("invalid form");
    }
  }

  confirmDelete(): void {
    console.log(this.questionToDelete.url)
    this.apiService.delete(this.questionToDelete.url).subscribe({
      next: () => {
        this.questions = this.questions.filter(question => question.url !== this.questionToDelete.url);
        this.modalService.dismissAll();
      },
      error: err => {
        console.error(err);
      }
    });
  }

  confirmDeleteSection(): void {
    this.apiService.delete(this.sectionToDelete.url).subscribe({
      next: () => {
        this.sections = this.sections.filter(section => section.url !== this.sectionToDelete.url);
        this.modalService.dismissAll();
        this.cdr.detectChanges();
      },
      error: err => {
        console.error(err);
      }
    });
  }

  confirmSaveSection(): void {
    if (this.editForm.valid) {
      const updatedSection = { ...this.selectedSection, ...this.editForm.value };

      this.apiService.edit(this.selectedSection.url, updatedSection ).subscribe({
        next: () => {
          this.editForm.reset();
          this.modalService.dismissAll();
          this.selectedSection = null;
          this.sections = this.sections.map(section => section.url === updatedSection.url ? updatedSection : section);
        },
        error: err => {
          console.error(err);
        }
      });
    }
  }

  hasQuestionWithSectionUrl(id: number): boolean {
    const sectionUrl = this.sections[id].url;
    return this.questions.some(question => question.section === sectionUrl);
  }

  reset_idx(){
    this.idx = 1;
  }

  inc_idx(){
    this.idx += 1;
  }

  reset_cont(){
    this.cont = 0;
  }

  inc_cont(){
    this.cont += 1;
  }

  reset_cont_q(){
    this.cont_question = 0;
  }

  inc_cont_q(){
    this.cont_question +=1;
  }
}
