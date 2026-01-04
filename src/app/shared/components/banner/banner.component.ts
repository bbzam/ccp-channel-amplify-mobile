import { Component, Input, inject, ComponentRef, ApplicationRef, createComponent, EnvironmentInjector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SigninComponent } from '../../../auth/components/signin/signin.component';
import { SignupComponent } from '../../../auth/components/signup/signup.component';

@Component({
  selector: 'app-banner',
  imports: [CommonModule],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css'
})
export class BannerComponent {
  @Input() banners: any[] = [];
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private signupDialogRef: ComponentRef<SignupComponent> | null = null;
  private signinDialogRef: ComponentRef<SigninComponent> | null = null;
  
  signUpOnClick(): void {
    this.openSignupDialog();
  }

  signInOnClick() {
    this.openSigninDialog();
  }

  private openSignupDialog() {
    if (this.signupDialogRef) {
      this.signupDialogRef.destroy();
    }

    this.signupDialogRef = createComponent(SignupComponent, {
      environmentInjector: this.injector
    });

    this.signupDialogRef.instance.isVisible = true;
    this.signupDialogRef.instance.closeDialog.subscribe(() => {
      this.closeSignupDialog();
    });

    this.appRef.attachView(this.signupDialogRef.hostView);
    document.body.appendChild(this.signupDialogRef.location.nativeElement);
  }

  private closeSignupDialog() {
    if (this.signupDialogRef) {
      this.appRef.detachView(this.signupDialogRef.hostView);
      this.signupDialogRef.destroy();
      this.signupDialogRef = null;
    }
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