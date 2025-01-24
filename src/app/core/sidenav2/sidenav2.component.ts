import { NgClass } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { curatorNavItems } from './sidenavItems';
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
  currentRoute!: string;
  @ViewChild('drawer') drawer!: MatDrawer;
  readonly curatorNavItems: any[] = curatorNavItems;
  readonly router = inject(Router);
  readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    // Get the initial route and listen for route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });
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
    this.dialog
      .open(UploadContentComponent)
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          console.log(data);
        }
      });
  }
}
