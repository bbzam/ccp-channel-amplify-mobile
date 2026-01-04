import { Injectable, inject, ComponentRef, ViewContainerRef, ApplicationRef, createComponent, EnvironmentInjector } from '@angular/core';
import { Router } from '@angular/router';
import {
  fetchAuthSession,
  signOut,
  signUp,
  confirmSignUp,
  signIn,
  resendSignUpCode,
} from 'aws-amplify/auth';
import { MessageDialogComponent, MessageType } from '../shared/dialogs/message-dialog/message-dialog.component';
import { VerifyAccountComponent } from './components/verify-account/verify-account.component';

interface CognitoIdTokenPayload {
  'cognito:groups'?: string[];
  'custom:paidUntil'?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn = false;
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private messageDialogRef: ComponentRef<MessageDialogComponent> | null = null;
  private verifyDialogRef: ComponentRef<VerifyAccountComponent> | null = null;

  constructor(
    private router: Router
  ) {
    this.checkPendingVerification();
  }

  async currentSession() {
    try {
      const { accessToken, idToken } = (await fetchAuthSession()).tokens ?? {};
      const payload = idToken?.payload as CognitoIdTokenPayload;
      const userRole = payload?.['cognito:groups']?.[0];

      if (!accessToken || !idToken) {
        this.handleLogout();
        return false;
      }

      this.setSessionData(idToken);

      // Navigate based on user role
      switch (userRole) {
        case 'USER':
          this.router.navigate(['/user']);
          break;
        case 'SUBSCRIBER':
        case 'FREE_SUBSCRIBER':
          this.router.navigate(['/subscriber']);
          break;
        default:
          this.router.navigate(['/home']);
          break;
      }
      
      return true;
    } catch (error) {
      console.error('Session error:', error);
      this.handleLogout();
      return false;
    }
  }

  private setSessionData(idToken: any) {
    sessionStorage.setItem('userId', String(idToken?.payload['sub']));
    sessionStorage.setItem('username', 
      `${idToken?.payload['given_name'] || ''} ${idToken?.payload['family_name'] || ''}`
    );
    sessionStorage.setItem('email', String(idToken?.payload['email']));
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('role', 
      String(idToken?.payload?.['cognito:groups']?.[0] || '')
    );
    this.isLoggedIn = true;
  }

  private handleLogout() {
    this.isLoggedIn = false;
    sessionStorage.setItem('isLoggedIn', 'false');
    this.router.navigate(['/home']);
  }

  async signIn(username: string, password: string): Promise<boolean> {
    try {
      const { nextStep } = await signIn({
        username: username,
        password: password,
      });

      if (nextStep.signInStep === 'DONE') {
        await this.currentSession();
        return true;
      }

      if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        // Direct user to verification instead of showing error
        this.openVerifyDialog(username, username);
        return false;
      }

      return false;
    } catch (error) {
      console.error('Sign in error:', error);
      this.handleError(error);
      return false;
    }
  }

  async signUp(data: any): Promise<boolean> {
    try {
      const { nextStep } = await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            email: data.email,
            given_name: data.firstname,
            family_name: data.lastname,
            birthdate: data.birthdate,
          },
        },
      });

      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        // Store pending verification data
        sessionStorage.setItem('pendingVerification', JSON.stringify({
          email: data.email,
          username: data.email
        }));
        return true;
      }

      return nextStep.signUpStep === 'DONE';
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Check if user already exists and has pending verification
      if (error.name === 'UsernameExistsException') {
        const pendingData = sessionStorage.getItem('pendingVerification');
        if (pendingData) {
          const { email } = JSON.parse(pendingData);
          if (email === data.email) {
            // Same email - redirect to verification
            this.openVerifyDialog(data.email, data.email);
            return true;
          }
        }
      }
      
      this.handleError(error);
      return false;
    }
  }

  public handleError(error: any) {
    this.showMessageDialog(String(error), 'error');
  }

  public handleSuccess(success: any) {
    this.showMessageDialog(String(success), 'success');
  }

  private showMessageDialog(message: string, type: MessageType) {
    if (this.messageDialogRef) {
      this.messageDialogRef.destroy();
    }

    this.messageDialogRef = createComponent(MessageDialogComponent, {
      environmentInjector: this.injector
    });

    this.messageDialogRef.instance.message = message;
    this.messageDialogRef.instance.type = type;
    this.messageDialogRef.instance.isVisible = true;
    this.messageDialogRef.instance.closeDialog.subscribe(() => {
      this.closeMessageDialog();
    });

    this.appRef.attachView(this.messageDialogRef.hostView);
    document.body.appendChild(this.messageDialogRef.location.nativeElement);
  }

  private closeMessageDialog() {
    if (this.messageDialogRef) {
      this.appRef.detachView(this.messageDialogRef.hostView);
      this.messageDialogRef.destroy();
      this.messageDialogRef = null;
    }
  }

  private openVerifyDialog(destination: string, username: string) {
    if (this.verifyDialogRef) {
      this.verifyDialogRef.destroy();
    }

    this.verifyDialogRef = createComponent(VerifyAccountComponent, {
      environmentInjector: this.injector
    });

    this.verifyDialogRef.instance.destination = destination;
    this.verifyDialogRef.instance.username = username;
    this.verifyDialogRef.instance.isVisible = true;
    this.verifyDialogRef.instance.closeDialog.subscribe(() => {
      this.closeVerifyDialog();
    });

    this.appRef.attachView(this.verifyDialogRef.hostView);
    document.body.appendChild(this.verifyDialogRef.location.nativeElement);
  }

  private closeVerifyDialog() {
    if (this.verifyDialogRef) {
      this.appRef.detachView(this.verifyDialogRef.hostView);
      this.verifyDialogRef.destroy();
      this.verifyDialogRef = null;
    }
  }

  async confirmSignUp(username: string, code: string): Promise<boolean> {
    try {
      const { nextStep } = await confirmSignUp({
        username: username,
        confirmationCode: code,
      });

      if (nextStep.signUpStep === 'DONE') {
        // Clear pending verification data
        sessionStorage.removeItem('pendingVerification');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Confirm sign up error:', error);
      throw error;
    }
  }

  async resendConfirmationCode(username: string): Promise<boolean> {
    try {
      await resendSignUpCode({
        username: username,
      });
      return true;
    } catch (error) {
      console.error('Resend confirmation code error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await signOut({ global: true });
      sessionStorage.clear();
      localStorage.clear();
      this.isLoggedIn = false;
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const { accessToken, idToken } = (await fetchAuthSession()).tokens ?? {};
      return !!accessToken && !!idToken;
    } catch (err) {
      return false;
    }
  }

  private checkPendingVerification(): void {
    const pendingData = sessionStorage.getItem('pendingVerification');
    if (pendingData) {
      const { email, username } = JSON.parse(pendingData);
      // Auto-open verification modal on app load/refresh
      setTimeout(() => {
        this.openVerifyDialog(email, username);
      }, 100);
    }
  }

  clearPendingVerification(): void {
    sessionStorage.removeItem('pendingVerification');
  }
}