import { CommonModule } from '@angular/common';
import { Component, output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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

  ioForm: FormGroup;

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
    private ioService: InputOutputService,
    private fb: FormBuilder
  ) {
    this.ioForm = this.fb.group({
      input: [''],
      output: [''],
      visible: true
    });
  }

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

  updateInputOutput(io: InputOutput): void{
      const updatedIO: InputOutput = { ...io}

      this.ioService.editInputOutput(io.url,updatedIO).subscribe({
        next: newIO => {
          console.log(newIO);
        }
      })
  }

  visibleChange(io: InputOutput): void {
    io.visible = !io.visible;
    this.updateInputOutput(io);
  }

  deleteInputOutput(url: string, io: InputOutput): void {
    this.ioService.deleteInputOutput(url).subscribe({
      next: () => {
        this.inputs_outputs = this.inputs_outputs.filter(input_output => input_output !== io)
        console.log("deleted");
      }
    })
  }
}
