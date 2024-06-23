import { Component,  } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from '../../components/nav/nav.component';
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent {

}