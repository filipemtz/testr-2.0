import { Component, computed, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ButtonCloseDirective, ButtonDirective, ModalBodyComponent, ModalComponent,
  ModalFooterComponent, ModalHeaderComponent, ModalTitleDirective,
} from '@coreui/angular';
import { FormField } from './mooc.forms';

/** Generic create/edit dialog driven by a field list. Create it with @if and destroy it on close. */
@Component({
  selector: 'app-entity-form-modal',
  imports: [ReactiveFormsModule, ModalComponent, ModalHeaderComponent, ModalTitleDirective,
            ModalBodyComponent, ModalFooterComponent, ButtonDirective, ButtonCloseDirective],
  template: `
    <c-modal [visible]="true" alignment="center" backdrop="static" (visibleChange)="!$event && closed.emit()">
      <form [formGroup]="form()" (ngSubmit)="submit()">
        <c-modal-header>
          <h5 cModalTitle>{{ title() }}</h5>
          <button cButtonClose type="button" (click)="closed.emit()"></button>
        </c-modal-header>
        <c-modal-body>
          @for (f of fields(); track f.key) {
            <div class="mb-3">
              <label class="form-label" [for]="'f-' + f.key">{{ f.label }}</label>
              @switch (f.type) {
                @case ('textarea') {
                  <textarea class="form-control" rows="3" [id]="'f-' + f.key" [formControlName]="f.key"></textarea>
                }
                @case ('select') {
                  <select class="form-select" [id]="'f-' + f.key" [formControlName]="f.key">
                    @for (o of f.options; track o.value) { <option [value]="o.value">{{ o.label }}</option> }
                  </select>
                }
                @case ('number') {
                  <input class="form-control" type="number" min="1" [id]="'f-' + f.key" [formControlName]="f.key"
                         [class.is-invalid]="invalid(f.key)" />
                }
                @default {
                  <input class="form-control" type="text" [id]="'f-' + f.key" [formControlName]="f.key"
                         [placeholder]="f.placeholder ?? ''" [class.is-invalid]="invalid(f.key)" />
                }
              }
            </div>
          }
        </c-modal-body>
        <c-modal-footer>
          <button cButton color="secondary" variant="outline" type="button" (click)="closed.emit()">Cancel</button>
          <button cButton color="primary" type="submit">Save</button>
        </c-modal-footer>
      </form>
    </c-modal>
  `,
})
export class EntityFormModalComponent {
  readonly title = input.required<string>();
  readonly fields = input.required<FormField[]>();
  readonly value = input<Record<string, unknown>>({});
  readonly saved = output<Record<string, unknown>>();
  readonly closed = output<void>();

  protected readonly form = computed(() => new FormGroup(
    Object.fromEntries(this.fields().map(f => [
      f.key,
      new FormControl<unknown>(this.value()[f.key] ?? '', f.required ? Validators.required : null),
    ])) as Record<string, FormControl>,
  ));

  protected invalid(key: string) {
    const c = this.form().get(key);
    return !!c && c.touched && c.invalid;
  }

  protected submit() {
    const form = this.form();
    if (form.invalid) { form.markAllAsTouched(); return; }
    this.saved.emit(form.getRawValue());
  }
}
