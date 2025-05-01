import { Component, inject } from '@angular/core';
import { Header2Component } from '../../core/header2/header2.component';
import { Sidenav2Component } from '../../core/sidenav2/sidenav2.component';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-admin',
  imports: [
    Header2Component,
    Sidenav2Component,
    RouterOutlet,
    MatSidenavModule,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent {}
