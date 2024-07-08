import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Question } from '../../interfaces/question';
import { QuestionService } from '../../services/question.service';

@Component({
  selector: 'app-input-output',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, FormsModule, ReactiveFormsModule],
  templateUrl: './input-output.component.html',
  styleUrl: './input-output.component.css'
})
export class InputOutputComponent {
  questionId: number = -1;
  currentQuestion: Question = {} as Question;
  constructor (
    private route: ActivatedRoute,
    private questionService: QuestionService,

  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('questionId');
    if (id !== null){
      this.questionId = +id;
      console.log(this.questionId);
      this.questionService.getQuestion(this.questionId).subscribe({
        next: question => {
          this.currentQuestion = question;
          console.log(question);
        }
      })
    }
    else 
      console.error('Sem ID');
  }
}
