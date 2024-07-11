import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgbDropdown, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterModule, CommonModule, NgbDropdownModule, NgbDropdown],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
})
export class NavComponent implements OnInit {
  authenticated = false;
  user : any = {
    username: '',
  }
  constructor(private authService: AuthService, private router: Router) {
    

  }

  /*
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
      id: 'teacher',
      label: 'Teacher',
      icon: 'fas fa-user-tie',
      link: '/teacher'
    }
  ];*/

  

  ngOnInit(): void {
    this.authenticated = localStorage.getItem('authenticated') === 'true';
    if (this.authenticated){
      this.authService.profile().subscribe({
        next: (res: any) => {
          this.user = res;
        }
      });
    }
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
        localStorage.removeItem('user');
        this.authenticated = false;
        // AuthService.authEmitter.emit(false);
        this.router.navigate(['/accounts/login']);
      },
    });
  }

  



}