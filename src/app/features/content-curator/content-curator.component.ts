import { Component, inject } from '@angular/core';
import { Header2Component } from '../../core/header2/header2.component';
import { Sidenav2Component } from '../../core/sidenav2/sidenav2.component';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-content-curator',
  imports: [
    Header2Component,
    Sidenav2Component,
    RouterOutlet,
    MatSidenavModule,
  ],
  templateUrl: './content-curator.component.html',
  styleUrl: './content-curator.component.css',
})
export class ContentCuratorComponent {}
