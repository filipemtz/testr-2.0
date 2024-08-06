import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Question } from '../../interfaces/question';
import { QuestionService } from '../../services/question.service';
import { SubmissionService } from '../../services/submission.service';
import { ActivatedRoute } from '@angular/router';
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
export class QuestionDetailPageComponent implements OnInit {
  question: Question = {} as Question;
  questionFiles: QuestionFile[] = [] as QuestionFile[];
  ios: InputOutput[] = [] as InputOutput[];
  submission: any;
  selectedFile: File | null = null;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private questionService: QuestionService,
    private submissionService: SubmissionService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id !== null) {
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
        next: (ios: any) => {
          this.ios = ios;
        },
        error: (err) => {
          console.log(err);
        },
      });

      this.submissionService.getSubmission(+id).subscribe({
        next: (submission) => {
          this.submission = submission;
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  resetSubmissionStatus(): void {
    // TODO:
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onSubmitFile(): void {
    if (this.selectedFile) {
      const fileName = this.selectedFile.name;
      const questionId = this.question.id;

      this.submissionService.addSubmission(questionId, this.selectedFile, fileName).subscribe({
        next: (response) => {
          console.log('File uploaded successfully', response);
          this.selectedFile = null;
          this.submissionService.getSubmission(questionId).subscribe({
            next: (submission) => {
              this.submission = submission;
            },
            error: (err) => {
              console.log(err);
            },
          });
        },
        error: (err) => {
          console.log('Error uploading file', err);
        }
      });
    }
  }

  goBack(): void {
    this.location.back();
  }

  getLanguageName(value: string): string {
    if (value === 'PT') {
      return 'Python';
    } else if (value === 'CC') {
      return 'C/C++';
    }
    return '';
  }

  getSubmissionStatus(value: string): string {
    if (value === 'WE') {
      return 'Waiting Evaluation';
    }
    if (value === 'FL') {
      return 'Fail';
    }
    if (value === 'SC') {
      return 'Success';
    }
    return '';
  }
}
