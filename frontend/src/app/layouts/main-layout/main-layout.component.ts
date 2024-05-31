import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet, 
    CommonModule, 
    NgbDropdownModule,
    RouterModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit{
  isLogged = false;
  user = {
    username: '',
    email: '',
  }



  sidebarItems = [
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

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.getProfile();
  }

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

  getProfile(){
    // Lógica para buscar perfil de usuário
    this.authService.profile().subscribe({
      next: response => {
        this.isLogged = true;
        this.user = response;
      },
      error: err => {
        console.error(err);
      }
    });
  }

  logout(){
    this.authService.logout().subscribe({
      next: response => {
        console.log(response);
        this.isLogged = false;
      },
      error: err => {
        console.error(err);
      }
    });
  }
}
