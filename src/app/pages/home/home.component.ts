import { Component, inject, ComponentRef, ApplicationRef, createComponent, EnvironmentInjector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { SigninComponent } from '../../auth/components/signin/signin.component';
import { HeaderComponent } from '../../core/header/header.component';
import { FooterComponent } from '../../core/footer/footer.component';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { featuredImages, topFeatured, allFeatured } from '../../shared/mock-data';
import { filter } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [CommonModule, HeaderComponent, FooterComponent, BannerComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private router = inject(Router);
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private signinDialogRef: ComponentRef<SigninComponent> | null = null;
  
  // Use exact same data as web app
  banners = topFeatured;
  images = featuredImages;
  allFeatured = allFeatured;

  constructor() {
    // Scroll to top on route change
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo(0, 0);
    });
  }

  signIn() {
    this.openSigninDialog();
  }
  
  register() {
    this.signIn();
  }

  private openSigninDialog() {
    if (this.signinDialogRef) {
      this.signinDialogRef.destroy();
    }

    this.signinDialogRef = createComponent(SigninComponent, {
      environmentInjector: this.injector
    });

    this.signinDialogRef.instance.isVisible = true;
    this.signinDialogRef.instance.closeDialog.subscribe(() => {
      this.closeSigninDialog();
    });

    this.appRef.attachView(this.signinDialogRef.hostView);
    document.body.appendChild(this.signinDialogRef.location.nativeElement);
  }

  private closeSigninDialog() {
    if (this.signinDialogRef) {
      this.appRef.detachView(this.signinDialogRef.hostView);
      this.signinDialogRef.destroy();
      this.signinDialogRef = null;
    }
  }
}