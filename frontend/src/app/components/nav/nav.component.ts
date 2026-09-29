import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, TemplateRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-nav',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
        RouterModule,
        CommonModule,
    ],
    templateUrl: './nav.component.html',
    styleUrl: './nav.component.css',
})
export class NavComponent implements OnInit {
    authenticated = false;
    user: any = {
        username: '',
    };
    constructor(
        private authService: AuthService,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.authenticated = localStorage.getItem('authenticated') === 'true';
        if (this.authenticated) {
            this.authService.profile().subscribe({
                next: (res: any) => {
                    this.user = res;
                },
            });
        }
        // AuthService.authEmitter.subscribe((authenticated) => {
        //   this.authenticated = authenticated;
        //   console.log('olaaaa');
        // });
    }

    logout() {
        this.authService.logout().subscribe({
            next: () => {
                localStorage.removeItem('token');
                localStorage.removeItem('authenticated');
                localStorage.removeItem('user');
                this.authenticated = false;

                // remover todos os cookies
                document.cookie.split(';').forEach(function (c) {
                    document.cookie = c
                        .replace(/^ +/, '')
                        .replace(
                            /=.*/,
                            '=;expires=' + new Date().toUTCString() + ';path=/',
                        );
                });
                // AuthService.authEmitter.emit(false);
                this.router.navigate(['/accounts/login']);
            },
        });
    }
}
