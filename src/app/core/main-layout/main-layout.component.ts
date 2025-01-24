import {
  Component,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { navItems } from '../navigation/navItems';
import { filter } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidenavComponent } from '../sidenav/sidenav.component';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    MatSidenavModule,
    SidenavComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: SidenavComponent;
  readonly router = inject(Router);
  readonly activatedRoute = inject(ActivatedRoute);
  currentRoute!: string;
  routes: any[] = navItems;
  currentRouteIndex!: number; // Default to the first route
  isLoading: boolean = false;

  ngOnInit(): void {
    // Get the initial route and listen for route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });
    this.currentRouteIndex = this.routes.findIndex(
      (route) => route.routeLink === this.currentRoute
    );
  }

  get userRole(): string {
    return String(sessionStorage.getItem('role'));
  }

  @HostListener('window:scroll') onScroll() {
    const scrollTop = window.scrollY; // Current scroll position from top
    const scrollHeight = document.body.scrollHeight; // Total document height
    const viewportHeight = window.innerHeight; // Viewport height

    // // Prevent actions if already loading
    // if (this.isLoading) return;

    // // Scroll Down: Near the bottom
    // if (scrollTop + viewportHeight >= scrollHeight - 50) {
    //   this.navigateToNextRoute();
    // }

    // // Scroll Up: Near the top
    // if (scrollTop <= 50) {
    //   this.navigateToPreviousRoute();
    // }
  }

  navigateToNextRoute() {
    if (this.currentRouteIndex < this.routes.length - 1) {
      this.isLoading = true;
      this.currentRouteIndex++;
      this.showLoading(() => {
        this.router.navigate([this.routes[this.currentRouteIndex].routeLink]);
      });
    }
  }

  navigateToPreviousRoute() {
    if (this.currentRouteIndex > 0) {
      this.isLoading = true;
      this.currentRouteIndex--;
      this.showLoading(() => {
        this.router.navigate([this.routes[this.currentRouteIndex].routeLink]);
      });
    }
  }

  showLoading(callback: () => void) {
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Reset scroll to top
    // Simulate loading indicator
    setTimeout(() => {
      callback();
      this.isLoading = false;
    }, 1000); // Adjust loading duration as needed
  }
}
