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
export class MainLayoutComponent implements OnInit {
  isLogged = false; // Flag para verificar se o usuário está logado
  user = {
    username: '',
    email: '',
  };

  // Configuração dos itens da barra lateral
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

  // Método de ciclo de vida que é chamado após a inicialização do componente
  ngOnInit(): void {
    this.getProfile(); // Busca os dados do perfil do usuário ao inicializar o componente
  }

  // Método que utiliza o AuthService para buscar o perfil do usuário
  getProfile() {
    this.authService.profile().subscribe({
      next: response => {
        this.isLogged = true; // Define o usuário como logado
        this.user = response; // Atualiza os dados do usuário
      },
      error: err => {
        console.error(err); 
      }
    });
  }

  // Método que utiliza o AuthService para realizar o logout do usuário
  logout() {
    this.authService.logout().subscribe({
      next: response => {
        this.isLogged = false; 
      },
      error: err => {
        console.error(err); 
      }
    });
  }
}