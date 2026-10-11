import { Routes } from '@angular/router';
import { ReportPageComponent } from './pages/report-page/report-page.component';
import { LoginLayoutComponent } from './layouts/login-layout/login-layout.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { StudentPageComponent } from './pages/student-page/student-page.component';
import { ProfessorPageComponent } from './pages/professor-page/professor-page.component';
import { IndexPageComponent } from './pages/index-page/index-page.component';
import { CoursesDetailPageComponent } from './pages/courses-detail-page/courses-detail-page.component';
import { QuestionDetailPageComponent } from './pages/question-detail-page/question-detail-page.component';
import { QuestionEditPageComponent } from './pages/question-edit-page/question-edit-page.component';
import { CanActivateAdmin } from './guards/admin.guard'; // Importa o guardião que verifica se o usuário é um administrador
import { CanActivateStudent } from './guards/student.guard';
import { CanActivateTeacher } from './guards/teacher.guard';

import { authenticatedGuard } from './guards/authenticated.guard';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { ForbiddenPageComponent } from './pages/forbidden/forbidden.component';
import { CanActivateTeacherOrStudent } from './guards/teacher-or-student.guard';
import { DefaultLayoutComponent } from './layouts';
import { CourseDetailComponent } from './components/course-detail/course-detail.component';


export const routes: Routes = [
    {
        path: 'accounts',
        component: LoginLayoutComponent,
        data: { breadcrumb: 'Accounts' },
        children: [
            {
                path: 'login',
                component: LoginPageComponent,
                data: { breadcrumb: 'Login' }
            },
            {
                path: 'register',
                component: RegisterPageComponent,
                data: { breadcrumb: 'Register' }
            },
        ]
    },
    {
        path: 'forbidden',
        component: ForbiddenPageComponent,
        data: { breadcrumb: 'Forbidden' },
    },
    {
        path: '',
        component: DefaultLayoutComponent,
        data: {
            title: 'Home',
            breadcrumb: 'Home'
        },
        children: [
            {
                path: '',
                component: MainLayoutComponent,
                data: { breadcrumb: 'Home' },
                canActivate: [authenticatedGuard],
                children: [
                    {
                        path: '',
                        component: IndexPageComponent,
                        data: { breadcrumb: 'Index' },
                        canActivate: [CanActivateTeacherOrStudent]
                    },
                    {
                        path: 'course/:id',
                        component: CourseDetailComponent,
                        data: { breadcrumb: 'Course' },
                    },
                    {
                        path: 'course/:id/report',
                        component: ReportPageComponent,
                        data: { breadcrumb: 'Report' }
                    },
                    {
                        path: 'question/:id',
                        component: QuestionDetailPageComponent,
                        data: { breadcrumb: 'Question' }
                    },
                    {
                        path: 'question/:questionId/edit',
                        component: QuestionEditPageComponent,
                        data: { breadcrumb: 'Edit' },
                        canActivate: [CanActivateTeacher]
                    },
                    {
                        path: 'admin',
                        component: AdminPageComponent,
                        data: { breadcrumb: 'Admin' },
                        canActivate: [CanActivateAdmin]
                    },
                    {
                        path: 'student',
                        component: StudentPageComponent,
                        data: { breadcrumb: 'Student' },
                        canActivate: [CanActivateStudent]
                    },
                    {
                        path: 'teacher',
                        component: ProfessorPageComponent,
                        data: { breadcrumb: 'Teacher' },
                        canActivate: [CanActivateTeacher]
                    },
                    {
                        path: 'profile',
                        component: UserProfileComponent,
                        data: { breadcrumb: 'Profile' }
                    }
                ]
            },
        ],
    },
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    }
];
