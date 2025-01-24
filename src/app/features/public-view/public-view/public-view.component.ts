import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../core/header/header.component';
import { FooterComponent } from '../../../core/footer/footer.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidenavComponent } from '../../../core/sidenav/sidenav.component';
import { HomePageComponent } from '../home-page/home-page.component';

@Component({
  selector: 'app-public-view',
  imports: [
    HeaderComponent,
    FooterComponent,
    MatSidenavModule,
    SidenavComponent,
    HomePageComponent
  ],
  templateUrl: './public-view.component.html',
  styleUrl: './public-view.component.css',
})
export class PublicViewComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: SidenavComponent;
  readonly router = inject(Router);

  ngOnInit(): void {}
}
