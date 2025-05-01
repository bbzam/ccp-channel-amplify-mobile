import {
  Component,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../core/header/header.component';
import { FooterComponent } from '../../../core/footer/footer.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidenavComponent } from '../../../core/sidenav/sidenav.component';
import { navItems } from '../../../core/navigation/navItems';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-subscriber',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    MatSidenavModule,
    SidenavComponent,
    NgClass,
  ],
  templateUrl: './subscriber.component.html',
  styleUrls: ['./subscriber.component.css'],
})
export class SubscriberComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: SidenavComponent;
  readonly router = inject(Router);
  currentIndex = 0;
  private lastScrollTop = 0;
  public direction: 'up' | 'down' | null = null;
  private scrollAttempts = 0;
  private isNavigating = false;

  // Max attempts before triggering navigation
  private readonly maxAttempts = 2;

  // To control visibility of scroll hint
  showScrollHint = false;

  ngOnInit(): void {
    this.router.navigateByUrl(navItems[this.currentIndex].routeLink);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentRoute = event.urlAfterRedirects;
        const index = navItems.findIndex(
          (item) => item.routeLink === currentRoute
        );
        if (index !== -1) this.currentIndex = index;
      }
    });
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    const currentScrollTop =
      window.pageYOffset || document.documentElement.scrollTop;

    if (this.isNavigating) return;

    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    // Detect scroll direction
    const newDirection = currentScrollTop > this.lastScrollTop ? 'down' : 'up';
    this.lastScrollTop = currentScrollTop;

    if (newDirection !== this.direction) {
      this.direction = newDirection;
      this.scrollAttempts = 1; // reset counter for new direction
    } else {
      this.scrollAttempts++;
    }

    // Detect if we are near top or bottom
    const isNearBottom = currentScrollTop + clientHeight >= scrollHeight - 10;
    const isNearTop = currentScrollTop <= 10;

    // Check if there's a next or previous route available
    const hasNext = this.currentIndex < navItems.length - 1;
    const hasPrevious = this.currentIndex > 0;

    // Show scroll hint based on direction and availability of next/previous route
    this.showScrollHint =
      (isNearBottom && hasNext) || (isNearTop && hasPrevious);

    // If scroll attempts exceed max, trigger navigation
    if (this.scrollAttempts >= this.maxAttempts) {
      if (this.direction === 'down' && isNearBottom && hasNext) {
        this.goToNextRoute();
      } else if (this.direction === 'up' && isNearTop && hasPrevious) {
        this.goToPreviousRoute();
      }
    }
  }

  goToNextRoute() {
    if (this.currentIndex < navItems.length - 1) {
      this.isNavigating = true;
      this.currentIndex++;
      this.router
        .navigateByUrl(navItems[this.currentIndex].routeLink)
        .finally(() => this.reset());
    }
  }

  goToPreviousRoute() {
    if (this.currentIndex > 0) {
      this.isNavigating = true;
      this.currentIndex--;
      this.router
        .navigateByUrl(navItems[this.currentIndex].routeLink)
        .finally(() => this.reset());
    }
  }

  reset() {
    this.isNavigating = false;
    this.scrollAttempts = 0;
    this.direction = null;
    setTimeout(() => window.scrollTo(0, 10), 100); // move away from absolute top
  }
}
