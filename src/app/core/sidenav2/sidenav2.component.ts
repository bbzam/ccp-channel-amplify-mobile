import { NgClass } from '@angular/common';
import {
  Component,
  HostListener,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import {
  curatorNavItems,
  itAdminNavItems,
  superAdminNavItems,
} from './sidenavItems';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { UploadContentComponent } from '../../features/content-curator/manage-content/upload-content/upload-content.component';
import { AddUserComponent } from '../../features/IT-admin/manage-user/add-user/add-user.component';
import { AddKeyComponent } from '../../beta-test/add-key/add-key.component';
import { SharedService } from '../../shared/shared.service';
import { InputComponent } from '../../shared/component/input/input.component';

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
  readonly sharedService = inject(SharedService);
  private userRole!: string;
  currentRoute!: string;
  lastSegment!: string;
  navItems: any[] = [];

  @HostListener('window:resize') updatetoggleDrawer(): void {
    const width = window.innerWidth;
    if (width <= 800) {
      this.closeToggleDrawer();
    }
  }

  constructor() {}

  ngOnInit(): void {
    // Get the initial route and listen for route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
        this.lastSegment = this.currentRoute.split('/').pop() || '';
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

  toggleExpand(item: any, event: Event): void {
    event.stopPropagation();
    item.expanded = !item.expanded;
  }

  uploadNewContent() {
    // this.router.navigate(['content-curator/upload-content']);
    this.dialog
      .open(UploadContentComponent, {
        disableClose: true,
        panelClass: 'dialog',
      })
      .afterClosed()
      .subscribe((data) => {});
  }

  addNewUser() {
    this.dialog
      .open(AddUserComponent, { disableClose: true, panelClass: 'dialog2' })
      .afterClosed()
      .subscribe((data) => {});
  }

  addNewKey() {
    this.dialog
      .open(AddKeyComponent, { disableClose: true, panelClass: 'dialog2' })
      .afterClosed()
      .subscribe((data) => {});
  }

  async addCustomFields(): Promise<void> {
    const content = {
      inputType: 'text',
      title: 'Add Custom Field',
      subtitle: '',
      label: 'Field Name',
      placeholder: 'Enter the field name',
      buttonText: 'Create',
      buttonTextLoading: 'Creating...',
    };
    this.dialog
      .open(InputComponent, { data: content })
      .afterClosed()
      .subscribe(async (data) => {
        if (data) {
          const customFieldData = {
            fieldName: data,
          };

          await this.sharedService.addCustomField(customFieldData);
        }
      });
  }

  async createTag(): Promise<void> {
    const content = {
      inputType: 'text',
      title: 'Create a Tag',
      subtitle: '',
      label: 'Tag Name',
      placeholder: 'Enter the tag name',
      buttonText: 'Create',
      buttonTextLoading: 'Creating...',
    };
    this.dialog
      .open(InputComponent, { data: content })
      .afterClosed()
      .subscribe(async (data) => {
        if (data) {
          const tagData = {
            tag: data,
            isVisible: true,
          };

          await this.sharedService.addTag(tagData);
        }
      });
  }
}
