import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-login-layout',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [RouterOutlet, MatButtonModule],
    templateUrl: './login-layout.component.html',
    styleUrl: './login-layout.component.css'
})
export class LoginLayoutComponent {

}
