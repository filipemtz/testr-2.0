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
export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authenticatedGuard],
    children: [
      {
        path: '',
        component: IndexPageComponent,
        canActivate: [CanActivateTeacherOrStudent]
      },
      { 
        path: 'course/:id', 
        component: CoursesDetailPageComponent
      },
      {
        path: 'course/:id/report', 
        component: ReportPageComponent
      },
      { 
        path: 'question/:id', 
        component: QuestionDetailPageComponent
        
      },
      { 
        path: 'question/:questionId/edit', 
        component: QuestionEditPageComponent,
        canActivate: [CanActivateTeacher]
      },
      {
        path: 'admin',
        component: AdminPageComponent,
        canActivate: [CanActivateAdmin] 
      },
      {
        path: 'student',
        component: StudentPageComponent,
        canActivate: [CanActivateStudent]
      },
      {
        path: 'teacher',
        component: ProfessorPageComponent,
        canActivate: [CanActivateTeacher]
      },
      {
        path: 'profile',
        component: UserProfileComponent
      }
    ]
  },
  {
    path: 'accounts',
    component: LoginLayoutComponent,
    children: [
      {
        path: 'login',
        component: LoginPageComponent
      },
      {
        path: 'register',
        component: RegisterPageComponent
      },
    ]
  },
  {
    path: 'forbidden',
    component: ForbiddenPageComponent
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
