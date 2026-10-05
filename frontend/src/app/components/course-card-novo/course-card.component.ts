import { Component, input, output } from '@angular/core';
import { BadgeComponent, CardBodyComponent, CardComponent, ProgressBarComponent, ProgressComponent } from '@coreui/angular';
import { Course, Role } from './mooc.store';

@Component({
    selector: 'app-course-card-new',
    imports: [CardComponent, CardBodyComponent, BadgeComponent, ProgressComponent, ProgressBarComponent],
    host: {
        // Max visible lines before the text is clipped with "…" (configurable per instance).
        '[style.--mooc-title-lines]': 'titleLines()',
        '[style.--mooc-desc-lines]': 'descLines()',
    },
    template: `
    <c-card class="mooc-card" tabindex="0" role="button"
            (click)="opened.emit(course().id)" (keydown.enter)="opened.emit(course().id)">
      <c-card-body class="d-flex flex-column">
        <!-- Fixed slots: items keep their position even when a value is empty -->
        <div class="meta d-flex justify-content-between align-items-center mb-2">
          <span>@if (course().program) { <c-badge color="primary" shape="rounded-pill">{{ course().program }}</c-badge> }</span>
          <span>@if (course().semester) { <c-badge color="secondary" shape="rounded-pill">{{ course().semester }}</c-badge> }</span>
        </div>
        <h5 class="title clamp mb-0" [title]="course().title">{{ course().title }}</h5>
        <p class="desc clamp text-body-secondary mt-2 mb-0" [title]="course().description">{{ course().description }}</p>

        <div class="mt-auto pt-3">
          <small class="text-body-secondary">
            {{ course().sections.length }} sections · {{ activityCount() }} activities
          </small>
          @if (role() === 'student') {
            <c-progress thin class="mt-2" [attr.aria-label]="'Progress ' + progress() + '%'">
              <c-progress-bar color="success" [value]="progress()" />
            </c-progress>
            <small class="text-body-secondary">{{ progress() }}% completed</small>
          } @else {
            <div class="small text-primary mt-2">Click to edit this course</div>
          }
        </div>
      </c-card-body>
    </c-card>
  `,
    styles: `
    :host { display: block; height: 100%; }
    .mooc-card { height: 100%; cursor: pointer; transition: transform .15s, border-color .15s; }
    .mooc-card:hover { transform: translateY(-2px); border-color: var(--cui-primary); }
    .meta { height: 1.5rem; }
    .clamp { display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; }
    .title { line-height: 1.3; height: calc(1.3em * var(--mooc-title-lines)); -webkit-line-clamp: var(--mooc-title-lines); }
    .desc  { line-height: 1.4; height: calc(1.4em * var(--mooc-desc-lines));  -webkit-line-clamp: var(--mooc-desc-lines); }
  `,
})
export class CourseCardComponentNew {
    readonly course = input.required<Course>();
    readonly role = input.required<Role>();
    readonly progress = input(0);
    readonly titleLines = input(2);
    readonly descLines = input(2);
    readonly opened = output<string>();

    protected activityCount() {
        return this.course().sections.reduce((n, s) => n + s.activities.length, 0);
    }
}
