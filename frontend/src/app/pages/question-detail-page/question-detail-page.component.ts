import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Question } from '../../interfaces/question';
import { QuestionService } from '../../services/question.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DateFormatPipe } from '../../utils/date-format.pipe';
import { QuestionFile } from '../../interfaces/question-file';
import { CommonModule } from '@angular/common';
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
  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private questionService: QuestionService,
    private location: Location,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    id &&
      this.questionService.getQuestion(+id).subscribe({
        next: (question: Question) => {
          this.question = question;
        },
        error: (err) => {
          console.log(err);
        },
      });

    id &&
      this.questionService.getQuestionFiles(+id).subscribe({
        next: (files) => {
          this.questionFiles = files;
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  goBack(): void {
    this.location.back();
  }
}
