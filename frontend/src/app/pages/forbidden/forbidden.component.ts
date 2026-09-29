import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-forbidden',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [],
    templateUrl: './forbidden.component.html',
    styleUrl: './forbidden.component.css'
})
export class ForbiddenPageComponent {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    OnClickBackToHome() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('authenticated');
        this.router.navigate(['/']);
    }
}
