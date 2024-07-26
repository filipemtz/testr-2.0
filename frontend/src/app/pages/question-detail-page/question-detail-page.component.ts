import { Component, input } from "@angular/core";
import { AuthService } from '../../services/auth.service';
import { Question } from '../../interfaces/question';
import { QuestionService } from '../../services/question.service';
import { ActivatedRoute } from "@angular/router";
import { Location } from '@angular/common';
import { DateFormatPipe } from '../../utils/date-format.pipe';
import { QuestionFile } from '../../interfaces/question-file';
import { CommonModule } from '@angular/common';
import { InputOutput } from '../../interfaces/input-output';

@Component({
  selector: 'app-question-detail-page',
  standalone: true,
  imports: [DateFormatPipe, CommonModule],
  templateUrl: './question-detail-page.component.html',
  styleUrl: './question-detail-page.component.css',
})

export class QuestionDetailPageComponent {
  question: Question = {} as Question;
  questionFiles: QuestionFile[] = [] as QuestionFile[];
  ios: InputOutput[] = [] as InputOutput[];
  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private questionService: QuestionService,
    private location: Location,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id !== null){

      this.questionService.getQuestion(+id).subscribe({
        next: (question: Question) => {
          this.question = question;
        },
        error: (err) => {
          console.log(err);
        },
      });
      
      
      this.questionService.getQuestionFiles(+id).subscribe({
        next: (files) => {
          this.questionFiles = files;
        },
        error: (err) => {
          console.log(err);
        },
      });
     
      this.questionService.getInputsOutputs(+id).subscribe({
        next: (ios : any) => {
          console.log(ios);
          this.ios = ios;
        },
        error: (err) => {
          console.log(err);
        }
    });
    }
      
  }

  goBack(): void {
    this.location.back();
  }

  getLanguageName(value: string): string {
    if(value == "PT"){
      return "Python";
    }
    else if(value == "CC"){
      return "C/C++";
    }
    return "";
  }
}
