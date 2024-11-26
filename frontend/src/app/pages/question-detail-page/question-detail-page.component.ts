
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Question } from '../../models/question';
import { QuestionService } from '../../services/question.service';
import { SubmissionService } from '../../services/submission.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DateFormatPipe } from '../../utils/date-format.pipe';
import { QuestionFile } from '../../models/question-file';
import { CommonModule } from '@angular/common';
import { InputOutput } from '../../models/input-output';
import { environment } from '../../../environments/environment';
import Notify from 'simple-notify';
import 'simple-notify/dist/simple-notify.css';


@Component({
  selector: 'app-question-detail-page',
  standalone: true,
  imports: [DateFormatPipe, CommonModule],
  templateUrl: './question-detail-page.component.html',
  styleUrl: './question-detail-page.component.css',
})
export class QuestionDetailPageComponent implements OnInit {
  private intervalId: any;
  question: Question = {} as Question;
  questionFiles: QuestionFile[] = [] as QuestionFile[];
  ios: InputOutput[] = [] as InputOutput[];
  submission: any;

  selectedFile: File | null = null;
  apiUrl = `${environment.apiUrl}`;
  submissionsList: any[] = [];
  isProfessor: boolean = false;
  myNotify: any;

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

          this.question.description = this.question.description.replace(/\n/g, "<br>");
          this.question.description = this.question.description.replace(/  /g, "&nbsp;&nbsp;");

          this.authService.userInfo().subscribe({
            next: (response: any) => {
              this.isProfessor = response.groups.includes('teacher');
              this.getSubmissionsList();
            },
          });
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
          this.startSubmissionStatusCheck();
          //console.log(submission);
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  resetSubmissionStatus(): void {
    const questionId = this.question.id;

    this.submissionService.resetSubmission(questionId).subscribe({
      next: (response) => {
        console.log('Submission status reset successfully', response);
        this.getSubmission(questionId);
      },
      error: (err) => {
        console.log('Error resetting submission status', err);
      },
    });
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
          this.getSubmission(questionId);
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

  extractErrorMessages(data: string): string[] {
    if(data){
      const parsedData = JSON.parse(data);

      if (parsedData.error_msgs && Array.isArray(parsedData.error_msgs)) {
        return parsedData.error_msgs;
      }
    }
    return [];
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

  getReport(id: number): void {
    this.questionService.getReport(id).subscribe({
      next: (response) => {
        this.submissionsList = response;
      },
    });
  }

  getSubmissionsList(): void {
    const questionId = this.question.id;
    this.getReport(questionId);
  }

  resetAllSubmissions(): void {
    const questionId = this.question.id;

    this.submissionService.resetAllSubmissions(questionId).subscribe({
      next: (response) => {
        this.pushNotify('Success!', 'All submissions reset successfully', 'success');
        this.getReport(questionId);
      },
      error: (err) => {
        this.pushNotify('Error!', 'Failed to reset all submissions', 'error');

      },
    });
  }

  pushNotify(title: string, text: string | undefined, status: any) {
    this.myNotify = new Notify({
      status: status,
      title: title,
      text: text,
      effect: 'slide',
      type: 'filled',
    });
  }

  getSubmission(id: number): void {
    this.submissionService.getSubmission(id).subscribe({
      next: (submission) => {
        this.submission = submission;
      },
      error: (err) => {
        console.log('Error getting submission:', err);
      }
    });
  }

  // A cada 30 segundos, verifica o status da submissão
  startSubmissionStatusCheck(): void {
    this.intervalId = setInterval(() => {
      if (this.submission) {
        this.getSubmission(this.submission.id);
      }
    }, 30000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
