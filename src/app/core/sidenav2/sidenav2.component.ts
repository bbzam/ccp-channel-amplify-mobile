import { NgClass } from '@angular/common';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { curatorNavItems, itAdminNavItems, superAdminNavItems } from './sidenavItems';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { UploadContentComponent } from '../../features/content-curator/upload-content/upload-content.component';

@Component({
  selector: 'app-sidenav2',
  imports: [
    MatSidenavModule,
    MatCardModule,
    MatIconModule,
    NgClass,
    MatButtonModule,
  ],
  templateUrl: './sidenav2.component.html',
  styleUrl: './sidenav2.component.css',
})
export class Sidenav2Component implements OnInit {
  @ViewChild('drawer') drawer!: MatDrawer;
  readonly router = inject(Router);
  readonly dialog = inject(MatDialog);
  private userRole!: string;
  currentRoute!: string;
  navItems: any[] = [];

  constructor() {}

  ngOnInit(): void {
    // Get the initial route and listen for route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });

    this.userRole = String(sessionStorage.getItem('role'));
    if (this.userRole === 'CONTENT_CREATOR') {
      this.navItems = curatorNavItems;
    } else if (this.userRole === 'IT_ADMIN') {
      this.navItems = itAdminNavItems;
    } else if (this.userRole === 'SUPER_ADMIN') {
      this.navItems = superAdminNavItems;
    }
  }

  toggleDrawer() {
    this.drawer.toggle(); // Toggle the drawer visibility
  }

  closeToggleDrawer() {
    this.drawer.close();
  }

  navigate(routeLink: string) {
    this.router.navigate([routeLink]);
  }

  uploadNewContent() {
    this.router.navigate(['content-curator/upload-content']);
    // this.dialog
    //   .open(UploadContentComponent)
    //   .afterClosed()
    //   .subscribe((data) => {
    //     if (data) {
    //       console.log(data);
    //     }
    //   });
  }
}
