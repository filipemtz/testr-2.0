import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AlertComponent } from '@coreui/angular';

@Component({
    selector: 'test-bootstrap',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [AlertComponent],
    templateUrl: './simple.component.html',
})
export class SimpleExampleCoreUI {
}
