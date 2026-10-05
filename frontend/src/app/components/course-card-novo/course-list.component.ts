import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonDirective } from '@coreui/angular';
import { CourseCardComponentNew } from './course-card.component';
import { EntityFormModalComponent } from './entity-form-modal.component';
import { RoleSwitcherComponent } from './role-switcher.component';
import { COURSE_FIELDS } from './mooc.forms';
import { MoocStore } from './mooc.store';

@Component({
    selector: 'app-course-list',
    imports: [ButtonDirective, CourseCardComponentNew, EntityFormModalComponent, RoleSwitcherComponent],
    template: `
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
      <div>
        <h3 class="mb-0">{{ store.isProfessor() ? 'Manage courses' : 'My courses' }}</h3>
        <small class="text-body-secondary">
          {{ store.isProfessor() ? 'Professor view: full editing' : 'Student view: read-only content' }}
        </small>
      </div>
      <div class="d-flex gap-2 align-items-center">
        <app-role-switcher />
        @if (store.isProfessor()) {
          <button cButton color="primary" (click)="creating.set(true)">+ New course</button>
        }
      </div>
    </div>

    <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
      @for (c of store.courses(); track c.id) {
        <div class="col">
          <app-course-card-new [course]="c" [role]="store.role()" [progress]="store.progress(c)"
                           [titleLines]="2" (opened)="open()" />
        </div>
      } @empty {
        <div class="col-12 text-center text-body-secondary py-5">No courses yet.</div>
      }
    </div>

    @if (creating()) {
      <app-entity-form-modal title="New course" [fields]="fields" [value]="{ program: '' }"
                             (saved)="create($event)" (closed)="creating.set(false)" />
    }
  `,
})
export class CourseListComponent {
    protected readonly store = inject(MoocStore);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    protected readonly creating = signal(false);
    protected readonly fields = COURSE_FIELDS;

    // protected open(id: string) { this.router.navigate([id], { relativeTo: this.route }); }
    protected open() { console.log('open called.'); }

    protected create(v: Record<string, unknown>) {
        this.store.addCourse({
            title: String(v['title']).trim(), description: String(v['description'] ?? '').trim(),
            program: String(v['program'] ?? ''), semester: String(v['semester'] ?? '').trim(),
        });
        this.creating.set(false);
    }
}
