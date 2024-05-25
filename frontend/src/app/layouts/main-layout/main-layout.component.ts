import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet, 
    MatSidenavModule, 
    MatToolbarModule, 
    MatListModule, 
    MatIconModule, 
    CommonModule, 
    MatButtonModule, 
    NgbDropdownModule,
    RouterModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent {
  sidebarItems = [
    {
      id: 'auth',
      label: 'Auth',
      icon: 'fas fa-shield-alt',
      dropdown: true,
      sublinks: [
        {
          id: 'login',
          label: 'Login',
          link: '/account/login'
        },
        {
          id: 'register',
          label: 'Register',
          link: '/account/register'
        }
      ]
    },
    {
      id: 'multi',
      label: 'Multi Level',
      icon: 'fas fa-layer-group',
      dropdown: true,
      sublinks: [
        {
          id: 'link1',
          label: 'Link 1',
          link: '/multi/link1'
        },
        {
          id: 'link2',
          label: 'Link 2',
          link: '/multi/link2'
        }
      ]
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: 'fas fa-user-tie',
      link: '/admin'
    },
    {
      id: 'student',
      label: 'Student',
      icon: 'fas fa-user-graduate',
      link: '/student'
    },
    {
      id: 'professor',
      label: 'Professor',
      icon: 'fas fa-user-tie',
      link: '/professor'
    }
  ];

  constructor() {}

  toggleSidebar() {
    const sidebar = document.querySelector("#sidebar");
    sidebar?.classList.toggle("expand");
  }

  toggleDropdown(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const parent = target.parentElement;
    const dropdown = parent?.querySelector('.sidebar-dropdown');

    if (dropdown?.classList.contains('show')) {
      parent?.classList.remove('expand');
    } else {
      parent?.classList.add('expand');
    }
  }
}
