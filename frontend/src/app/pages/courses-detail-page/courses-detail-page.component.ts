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

  addForm: FormGroup;
  editForm: FormGroup;
  
  idx: number = 1;
  cont: number = 0;

  questionToDelete: any;
  selectedQuestion: any;

  sectionToDelete: any;
  selectedSection: any;

  baseSection: Section = {
    name: "",
    course: ""
  };


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
    this.addForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  /*{
    "course": null,
    "name": "",
    "created_at": null
}*/

  ngOnInit(): void {
    this.authService.profile().subscribe( {next: () => {
        // Pegar um curso baseado no id atual da pagina
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

        // Pegar as sessões de um curso
        this.apiService.getSections().subscribe( {next: response => {
          this.sections = response.results;
          this.cdr.detectChanges();
        }, 
        error: err => {
          console.log(err);
        }});

        // Pegar as questoes de uma sessão
        this.apiService.getQuestions().subscribe( {next: response => {
          this.questions = response.results;
        },
        error: err => {
          console.log(err);
        }});
      },
      
      error: err => {
        this.router.navigate(['/accounts/login']);
      }
    });
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

  openEditSectionModal(section: any, content: TemplateRef<any>) {
    this.selectedSection = section;
    this.editForm.patchValue(section);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  confirmAddSection(): void {
    if(this.addForm.valid){
      const newSection = {...this.baseSection, ...this.addForm.value}

      this.apiService.post('sections/', newSection).subscribe({
        next: section => {
          this.addForm.reset();
          this.sections.push(section);
          this.modalService.dismissAll();
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
    console.log(this.sectionToDelete.url)
    this.apiService.delete(this.sectionToDelete.url).subscribe({
      next: () => {
        this.sections = this.sections.filter(section => section.url !== this.sectionToDelete.url);
        this.modalService.dismissAll();
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
}
