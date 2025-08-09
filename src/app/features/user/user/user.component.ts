import {
  Component,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../core/header/header.component';
import { FooterComponent } from '../../../core/footer/footer.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidenavComponent } from '../../../core/sidenav/sidenav.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-user',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    MatSidenavModule,
    SidenavComponent,
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
})
export class UserComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: SidenavComponent;
  readonly router = inject(Router);

  ngOnInit(): void {}
}
