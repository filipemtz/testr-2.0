import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LoginComponent } from '../../components/login/login.component';

@Component({
    selector: 'app-login-page',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [LoginComponent],
    templateUrl: './login-page.component.html',
    styleUrl: './login-page.component.css'
})
export class LoginPageComponent {

}
