import { Component, computed, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AccordionButtonDirective, AccordionComponent, AccordionItemComponent, BadgeComponent, ButtonDirective,
  CardBodyComponent, CardComponent, ProgressBarComponent, ProgressComponent, TemplateIdDirective,
} from '@coreui/angular';
import { ActivityItemComponent } from './activity-item.component';
import { EntityFormModalComponent } from './entity-form-modal.component';
import { RoleSwitcherComponent } from './role-switcher.component';
import { ACTIVITY_FIELDS, COURSE_FIELDS, FormField, SECTION_FIELDS } from './mooc.forms';
import { Activity, ActivityType, Course, MoocStore, Section } from './mooc.store';

interface Dialog {
  title: string;
  fields: FormField[];
  value: Record<string, unknown>;
  onSave: (v: Record<string, unknown>) => void;
}
const str = (v: unknown) => String(v ?? '').trim();

@Component({
  selector: 'app-course-detail',
  imports: [
    AccordionComponent, AccordionItemComponent, AccordionButtonDirective, TemplateIdDirective,
    BadgeComponent, ButtonDirective, CardComponent, CardBodyComponent, ProgressComponent, ProgressBarComponent,
    ActivityItemComponent, EntityFormModalComponent, RoleSwitcherComponent,
  ],
  template: `
    @if (course(); as c) {
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <button cButton color="secondary" variant="outline" size="sm" (click)="back()">← All courses</button>
        <app-role-switcher />
      </div>

      <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
        <div>
          <h3 class="mb-1">{{ c.title }}</h3>
          <div class="mb-2 d-flex gap-2">
            @if (c.program) { <c-badge color="primary" shape="rounded-pill">{{ c.program }}</c-badge> }
            @if (c.semester) { <c-badge color="secondary" shape="rounded-pill">{{ c.semester }}</c-badge> }
          </div>
          <div class="text-body-secondary">{{ c.description }}</div>
        </div>
        @if (store.isProfessor()) {
          <div class="d-flex gap-2">
            <button cButton color="primary" variant="outline" (click)="editCourse(c)">Edit course</button>
            <button cButton color="danger" variant="outline" (click)="removeCourse(c)">Delete</button>
          </div>
        }
      </div>

      @if (store.isProfessor()) {
        <div class="alert alert-info py-2">Editing mode: changes apply to all students.</div>
      } @else {
        <c-card class="mb-3">
          <c-card-body>
            <div class="d-flex justify-content-between mb-2">
              <strong>Your progress</strong>
              <span>{{ stats().pct }}% · {{ stats().done }} of {{ stats().total }} activities</span>
            </div>
            <c-progress [attr.aria-label]="'Course progress ' + stats().pct + '%'">
              <c-progress-bar color="success" [value]="stats().pct" />
            </c-progress>
          </c-card-body>
        </c-card>
      }

      <c-accordion [alwaysOpen]="true">
        @for (s of c.sections; track s.id) {
          <c-accordion-item #item="cAccordionItem" [visible]="true">
            <ng-template cTemplateId="accordionHeaderTemplate">
              <button cAccordionButton type="button" (click)="item.toggleItem()" [collapsed]="!item.visible">
                {{ s.title }}
                <small class="ms-2 text-body-secondary fw-normal">{{ summary(s) }}</small>
              </button>
            </ng-template>
            <ng-template cTemplateId="accordionBodyTemplate">
              <div class="accordion-body">
                @for (a of s.activities; track a.id) {
                  <app-activity-item [activity]="a" [done]="store.isDone(a.id)" [editable]="store.isProfessor()"
                                     (toggled)="store.toggleDone(a.id)"
                                     (editClick)="editActivity(c, s, a)" (removeClick)="removeActivity(c, s, a)" />
                } @empty {
                  <div class="text-center text-body-secondary py-3">No activities.</div>
                }
                @if (store.isProfessor()) {
                  <div class="d-flex flex-wrap gap-2 mt-3">
                    <button cButton size="sm" color="primary" variant="outline" (click)="addActivity(c, s)">+ Add activity</button>
                    <button cButton size="sm" color="secondary" variant="outline" (click)="renameSection(c, s)">Rename section</button>
                    <button cButton size="sm" color="danger" variant="outline" (click)="removeSection(c, s)">Delete section</button>
                  </div>
                }
              </div>
            </ng-template>
          </c-accordion-item>
        }
      </c-accordion>

      @if (store.isProfessor()) {
        <button cButton color="primary" class="mt-3" (click)="addSection(c)">+ Add section</button>
      }
    } @else {
      <div class="text-center text-body-secondary py-5">Course not found.</div>
    }

    @if (dialog(); as d) {
      <app-entity-form-modal [title]="d.title" [fields]="d.fields" [value]="d.value"
                             (saved)="d.onSave($event); dialog.set(null)" (closed)="dialog.set(null)" />
    }
  `,
})
export class CourseDetailComponent {
  /** Bound from the route param (requires withComponentInputBinding() in provideRouter). */
  readonly courseId = input.required<string>();

  protected readonly store = inject(MoocStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly dialog = signal<Dialog | null>(null);
  protected readonly course = computed(() => this.store.courses().find(c => c.id === this.courseId()));
  protected readonly stats = computed(() => {
    const c = this.course();
    const all = c ? c.sections.flatMap(s => s.activities) : [];
    const done = all.filter(a => this.store.isDone(a.id)).length;
    return { done, total: all.length, pct: c ? this.store.progress(c) : 0 };
  });

  protected summary(s: Section) {
    if (this.store.isProfessor()) return `${s.activities.length} activities`;
    return `${s.activities.filter(a => this.store.isDone(a.id)).length}/${s.activities.length} done`;
  }

  protected back() { this.router.navigate(['..'], { relativeTo: this.route }); }

  // ---- professor actions (each opens the generic form dialog) ---------------
  protected editCourse(c: Course) {
    this.open('Edit course', COURSE_FIELDS,
      { title: c.title, description: c.description, program: c.program, semester: c.semester },
      v => this.store.updateCourse(c.id, {
        title: str(v['title']), description: str(v['description']), program: str(v['program']), semester: str(v['semester']),
      }));
  }
  protected removeCourse(c: Course) {
    if (confirm('Delete this course?')) { this.store.removeCourse(c.id); this.back(); }
  }

  protected addSection(c: Course) {
    this.open('New section', SECTION_FIELDS, {}, v => this.store.addSection(c.id, str(v['title'])));
  }
  protected renameSection(c: Course, s: Section) {
    this.open('Rename section', SECTION_FIELDS, { title: s.title }, v => this.store.renameSection(c.id, s.id, str(v['title'])));
  }
  protected removeSection(c: Course, s: Section) {
    if (confirm('Delete this section?')) this.store.removeSection(c.id, s.id);
  }

  protected addActivity(c: Course, s: Section) {
    this.open('New activity', ACTIVITY_FIELDS, { type: 'video', minutes: 10 }, v =>
      this.store.addActivity(c.id, s.id, { title: str(v['title']), type: v['type'] as ActivityType, minutes: Number(v['minutes']) }));
  }
  protected editActivity(c: Course, s: Section, a: Activity) {
    this.open('Edit activity', ACTIVITY_FIELDS, { title: a.title, type: a.type, minutes: a.minutes }, v =>
      this.store.updateActivity(c.id, s.id, a.id, { title: str(v['title']), type: v['type'] as ActivityType, minutes: Number(v['minutes']) }));
  }
  protected removeActivity(c: Course, s: Section, a: Activity) {
    this.store.removeActivity(c.id, s.id, a.id);
  }

  private open(title: string, fields: FormField[], value: Record<string, unknown>, onSave: Dialog['onSave']) {
    this.dialog.set({ title, fields, value, onSave });
  }
}
