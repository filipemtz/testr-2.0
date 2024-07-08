import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Question } from '../../interfaces/question';
import { QuestionService } from '../../services/question.service';
import { InputOutput } from '../../interfaces/input-output';
import { InputOutputService } from '../../services/input-output.service';

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
  inputs_outputs: InputOutput[] = [];

  defaultIO: InputOutput = {
    id: -1,
    url: '',
    input: "",
    output: "",
    visible: true,
    question: -1
  }

  constructor (
    private route: ActivatedRoute,
    private questionService: QuestionService,
    private ioService: InputOutputService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('questionId');
    if (id !== null){
      this.questionId = +id;
      this.defaultIO.question = this.questionId;
      this.questionService.getInputsOutputs(this.questionId).subscribe({
        next: (ios : any) => {
          this.inputs_outputs = ios;
        }
      })
    }
    else 
      console.error('Sem ID');
  }

  createInputOutput(): void {
    this.ioService.postInputOutput(this.defaultIO).subscribe({
      next: io => {
        this.inputs_outputs.push(io);
      }
    })
  }
}
