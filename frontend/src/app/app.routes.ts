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

export const routes: Routes = [
  // adicionar como filho de MainLayoutComponent todos as páginas que seguem o layout principal
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/index-page/index-page.component').then(m => m.IndexPageComponent)
      },
      { 
        path: 'course/:id', 
        loadComponent: () => import('./pages/courses-detail-page/courses-detail-page.component').then(m => m.CoursesDetailPageComponent)
      },
      { 
        path: 'question/:id', 
        loadComponent: () => import('./pages/question-detail-page/question-detail-page.component').then(m => m.QuestionDetailPageComponent)
      },
      { 
        path: 'question/edit/:id', 
        loadComponent: () => import('./pages/question-edit-page/question-edit-page.component').then(m => m.QuestionEditPageComponent)
      },
      {
        path: 'admin',
        loadComponent: () => import('./pages/admin-page/admin-page.component').then(m => m.AdminPageComponent),
        canActivate: [CanActivateAdmin] 
      },
      {
        path: 'student',
        loadComponent: () => import('./pages/student-page/student-page.component').then(m => m.StudentPageComponent),
        canActivate: [CanActivateStudent]
      },
      {
        path: 'teacher',
        loadComponent: () => import('./pages/professor-page/professor-page.component').then(m => m.ProfessorPageComponent),
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
        loadComponent: () => import('./pages/login-page/login-page.component').then(m => m.LoginPageComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/register-page/register-page.component').then(m => m.RegisterPageComponent)
      }
    ]
  }
  

];
