import { Component, OnInit } from '@angular/core';
import { QuestionFileService } from '../../services/question-file.service';
import { QuestionService } from '../../services/question.service';
import { QuestionFile } from '../../interfaces/question-file';
import { CommonModule } from '@angular/common';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-upload-question-file',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-question-file.component.html',
  styleUrls: ['./upload-question-file.component.css'],
})
export class UploadQuestionFileComponent implements OnInit {
  questionId: number = 0;
  selectedFiles?: FileList;
  progressInfos: any[] = [];
  message: string[] = [];
  
  fileInfos?: Observable<any>;
  
  constructor(
    private questionFileService: QuestionFileService,
    private questionService: QuestionService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.questionId = params['questionId'];
      this.fileInfos = this.questionService.getQuestionFiles(this.questionId);
    });
  }

  

  deleteFile(fileId: number): void {
    this.questionFileService.deleteFile(fileId).subscribe({
      next: () => {
        this.fileInfos = this.questionService.getQuestionFiles(this.questionId);
      },
    });
  }

  selectFiles(event: any): void {
    this.message = [];
    this.progressInfos = [];
    this.selectedFiles = event.target.files;
  }

  uploadFiles(): void {
    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        this.upload(i, this.selectedFiles[i]);
      }
    }
  }

  upload(idx: number, file: File): void {
    this.progressInfos[idx] = { value: 0, fileName: file.name };

    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('question', this.questionId.toString());
      formData.append('file_name', file.name);

      this.questionFileService.createFile(formData).subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progressInfos[idx].value = Math.round((100 * event.loaded) / event.total);
          } else if (event instanceof HttpResponse) {
            const msg = 'Upload com sucesso do arquivo: ' + file.name;
            this.message.push(msg);
            this.fileInfos = this.questionService.getQuestionFiles(this.questionId);
          }
        },
        error: (err: any) => {
          this.progressInfos[idx].value = 0;
          const msg = 'Não foi possível fazer o upload do arquivo: ' + file.name;
          this.message.push(msg);
          this.fileInfos = this.questionService.getQuestionFiles(this.questionId);
        },
      });
    }
  }
}
