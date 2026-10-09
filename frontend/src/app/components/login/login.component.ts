import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { ChangeDetectionStrategy, Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { handleError } from '../../utils/handleError';
import {
    ButtonDirective,
    ColComponent,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    FormControlDirective,
    FormDirective,
    FormFeedbackComponent,
    FormLabelDirective,
    FormSelectDirective,
    GutterDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    RowDirective
} from '@coreui/angular';

import { cilLockLocked } from '@coreui/icons';
import { notify_error } from '../../utils/notifications';
import { TestrStore } from '../../services/testr.store';

export const iconSubset = {
    cilLockLocked
};

@Component({
    selector: 'app-login',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
        RouterLink,
        CommonModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        ReactiveFormsModule,
        FormsModule,
        FormDirective,
        RowDirective,
        GutterDirective,
        ColComponent,
        FormLabelDirective,
        FormControlDirective,
        FormFeedbackComponent,
        InputGroupComponent,
        InputGroupTextDirective,
        FormSelectDirective,
        FormCheckComponent,
        FormCheckInputDirective,
        FormCheckLabelDirective,
        ButtonDirective,
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
    protected readonly store = inject(TestrStore);
    readonly customStylesValidated = signal(false);
    form!: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    submit() {
        this.customStylesValidated.set(true);

        if (!this.form.valid) {
            notify_error("Existem campos inválidos no formulário.");
            return;
        }

        this.authService.login(this.form.getRawValue()).subscribe({
            next: (res: any) => {
                localStorage.setItem('user', JSON.stringify(res.user));
                localStorage.setItem('token', res.token);
                localStorage.setItem('authenticated', 'true');

                if (res.user.is_superuser) {
                    this.router.navigate(['/admin']);
                }
                else {
                    this.getUserGroups(res.user.groups).subscribe(groups => {
                        if (groups.includes('teacher'))
                            this.store.setProfessorRole();
                        else
                            this.store.setStudentRole();

                        this.redirectTo(groups);
                    });
                }
            },
            error: (error: any) => {
                handleError(error);
            }
        });
    }

    getUserGroups(groups: any[]) {
        if (!groups.length) {
            return of([]); // Return an observable of an empty array if no groups
        }

        const groupObservables = groups.map(groupId =>
            this.authService.getGroup(groupId).pipe(
                catchError(error => {
                    console.error('Error fetching group', groupId, error);
                    return of(null); // In case of error, return null or a default value
                })
            )
        );

        return forkJoin(groupObservables).pipe(
            map(results =>
                results
                    .filter(group => group !== null) // Filter out any null results due to errors
                    .map(group => group.name) // Assuming the group object has a 'name' property
            )
        );
    }

    redirectTo(groups: any[]) {
        // if (groups.includes('student')) {
        //   //this.router.navigate(['/student']);

        // } else if (groups.includes('teacher')) {
        //   // this.router.navigate(['/teacher']);

        // } else{
        //   this.router.navigate(['/']);
        // }
        this.router.navigate(['/']);
    }


}