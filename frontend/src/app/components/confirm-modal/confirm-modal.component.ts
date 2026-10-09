// confirm-host.component.ts
import { Component, inject } from '@angular/core';
import {
    ModalComponent, ModalHeaderComponent, ModalTitleDirective,
    ModalBodyComponent, ModalFooterComponent,
    ButtonDirective, ButtonCloseDirective,
} from '@coreui/angular';
import { ConfirmModalService } from './confirm-modal.service';

@Component({
    selector: 'app-confirm-modal',
    standalone: true,
    imports: [
        ModalComponent, ModalHeaderComponent, ModalTitleDirective,
        ModalBodyComponent, ModalFooterComponent, ButtonDirective, ButtonCloseDirective,
    ],
    template: `
    <c-modal
      [visible]="svc.visible()"
      (visibleChange)="!$event && svc.close(false)"
      alignment="center">
      <c-modal-header>
        <h5 cModalTitle>{{ svc.options().title }}</h5>
        <button cButtonClose (click)="svc.close(false)"></button>
      </c-modal-header>
      <c-modal-body>{{ svc.options().message }}</c-modal-body>
      <c-modal-footer>
        <button cButton color="secondary" (click)="svc.close(false)">
          {{ svc.options().cancelText }}
        </button>
        <button cButton [color]="svc.options().color" (click)="svc.close(true)">
          {{ svc.options().confirmText }}
        </button>
      </c-modal-footer>
    </c-modal>
  `,
})
export class ConfirmModalComponent {
    svc = inject(ConfirmModalService);
}