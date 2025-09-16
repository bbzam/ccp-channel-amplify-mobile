import { Component, HostListener, inject, OnInit } from '@angular/core';
import { navItems } from './navItems';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { NgClass } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navigation',
  imports: [RouterModule, NgClass],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css',
})
export class NavigationComponent implements OnInit {
  isScrolled: boolean = false;
  navItems: any[] = navItems;
  currentRoute: string = '';

  readonly router = inject(Router);
  readonly activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    // Set initial route
    this.currentRoute = this.router.url;

    // Listen for route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  @HostListener('window:scroll') onWindowScroll(): void {
    this.isScrolled = window.scrollY > 0;
  }

  isActiveRoute(routeLink: string): boolean {
    if (routeLink === '/subscriber') {
      return this.currentRoute === '/subscriber';
    }
    return this.currentRoute.startsWith(routeLink);
  }
}
