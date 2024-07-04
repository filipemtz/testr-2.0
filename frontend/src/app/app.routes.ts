import { Routes } from '@angular/router';
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
import { QuestionCreatePageComponent } from './pages/question-create-page/question-create-page.component';

import { authenticatedGuard } from './guards/authenticated.guard';
export const routes: Routes = [
  // adicionar como filho de MainLayoutComponent todos as páginas que seguem o layout principal
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authenticatedGuard],
    children: [
      {
        path: '',
        component: IndexPageComponent
      },
      { 
        path: 'course/:id', 
        component: CoursesDetailPageComponent 
      },
      { 
        path: 'question/:id', 
        component: QuestionDetailPageComponent
      },
      { 
        path: 'question/edit/:id', 
        component: QuestionEditPageComponent
      },
      {
        path: 'question/create/:sectionId',
        component: QuestionCreatePageComponent
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
      }
    ]
  }
  

];
