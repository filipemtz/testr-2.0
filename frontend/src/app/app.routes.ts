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


export const routes: Routes = [
  // adicionar como filho de MainLayoutComponent todos as páginas que seguem o layout principal
  {
    path: '',
    component: MainLayoutComponent,
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
        path: 'admin',
        component: AdminPageComponent
      },
      {
        path: 'student',
        component: StudentPageComponent
      },
      {
        path: 'teacher',
        component: ProfessorPageComponent
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
