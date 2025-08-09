import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { contents, Section } from './footer-contents';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { aboutDetails } from './footer-contents';
import { MatDividerModule } from '@angular/material/divider';

interface NavigationItem {
  label: string;
  url: string;
}

interface ContentSection {
  title: string;
  items: NavigationItem[];
}

@Component({
  selector: 'app-footer',
  imports: [MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent implements OnInit, OnDestroy {
  contents = JSON.parse(JSON.stringify(contents));

  readonly router = inject(Router);

  private routerSubscription!: Subscription;
  private parentRoute!: string;
  aboutDetails = aboutDetails;

  constructor() {}

  ngOnInit(): void {
    this.setupRouteListener();
  }

  private setupRouteListener(): void {
    this.updateRoutes();
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.updateRoutes());
  }

  private updateRoutes(): void {
    this.parentRoute = this.router.url.split('/')[1];

    const navigationUrls: Record<string, string> = {
      Home: this.parentRoute,
      About: `${this.parentRoute}/about`,
      'Privacy Policy': `${this.parentRoute}/privacy-policy`,
    };

    const navigationSection = this.contents.find(
      (section: ContentSection) => section.title === 'Navigation'
    );

    if (navigationSection && navigationSection.items) {
      navigationSection.items.forEach((item: NavigationItem) => {
        if (item.label in navigationUrls) {
          item.url = navigationUrls[item.label];
        }
      });
    }

    const legalSection = this.contents.find(
      (section: any) => section.title === 'Legal'
    );

    if (legalSection && legalSection.items) {
      legalSection.items.forEach((item: NavigationItem) => {
        if (item.label in navigationUrls) {
          item.url = navigationUrls[item.label];
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }
}
