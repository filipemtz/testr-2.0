import { Component, Input} from '@angular/core';
import { QuestionService } from '../../services/question.service';
import { CommonModule } from '@angular/common';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { Section } from '../../models/section';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-import-question',
  standalone: true,
  imports: [CommonModule, NgbProgressbarModule, FormsModule],
  templateUrl: './import-question.component.html',
  styleUrls: ['./import-question.component.css'],
})
export class ImportQuestionComponent {
  selectedFiles?: FileList;
  progressInfos: any[] = [];
  message: string[] = [];
  @Input() courseId!: number;
  section_name!: string;

  constructor(
    private questionService: QuestionService,
  ) {}

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
      formData.append('file_name', file.name);
      formData.append('course_id', this.courseId.toString());
      formData.append('section_name', this.section_name);

      this.questionService.importQuestion(formData).subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progressInfos[idx].value = Math.round((100 * event.loaded) / event.total);
          } else
          if (event instanceof HttpResponse) {
            const msg = 'Upload com sucesso da questão: ' + file.name;
            this.message.push(msg);
          }
        },
        error: (err: any) => {
          this.progressInfos[idx].value = 0;
          const msg = 'Não foi possível fazer o upload da questão: ' + file.name;
          this.message.push(msg);
        },
      });
    }
  }

  clearMessages() {
    this.message = [];
  }

  clearProgressInfos(){
    this.progressInfos = [] as any;
  }
}
