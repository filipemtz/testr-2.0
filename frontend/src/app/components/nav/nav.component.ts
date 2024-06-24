import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterModule, CommonModule, NgbDropdownModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
})
export class NavComponent implements OnInit {
  authenticated = false;

  constructor(private authService: AuthService, private router: Router) {}

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
  ngOnInit(): void {
    this.authenticated = localStorage.getItem('authenticated') === 'true';
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
        this.authenticated = false;
        // AuthService.authEmitter.emit(false);
        this.router.navigate(['/']);
      },
    });
  }
}