import { inject, Injectable } from '@angular/core';
import { SuccessMessageDialogComponent } from '../shared/dialogs/success-message-dialog/success-message-dialog.component';
import { ErrorMessageDialogComponent } from '../shared/dialogs/error-message-dialog/error-message-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {
  fetchAuthSession,
  signOut,
  signUp,
  confirmSignUp,
  signIn,
  resendSignUpCode,
  ResendSignUpCodeOutput,
} from 'aws-amplify/auth';
import { VerifyAccountComponent } from './components/verify-account/verify-account.component';
import { SharedService } from '../shared/shared.service';
import { SigninComponent } from './components/signin/signin.component';

interface CognitoIdTokenPayload {
  'cognito:groups'?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  isLoggedIn!: boolean;
  readonly dialog = inject(MatDialog);
  readonly router = inject(Router);
  readonly sharedService = inject(SharedService);

  constructor() {}

  async currentSession() {
    try {
      const { accessToken, idToken } = (await fetchAuthSession()).tokens ?? {};
      const payload = idToken?.payload as CognitoIdTokenPayload;
      const userRole = payload['cognito:groups']?.[0];
      if (!accessToken || !idToken) {
        this.handleLogout();
        return false;
      }
      this.setSessionData(idToken);
      switch (userRole) {
        case 'USER':
        case 'SUBSCRIBER':
          this.router.navigate(['/subscriber']);
          this.sharedService.hideLoader();
          break;
        case 'CONTENT_CREATOR':
          this.router.navigate(['/content-curator']);
          this.sharedService.hideLoader();
          break;
        case 'IT_ADMIN':
          this.router.navigate(['/it-admin']);
          this.sharedService.hideLoader();
          break;
        case 'SUPER_ADMIN':
          this.router.navigate(['/super-admin']);
          this.sharedService.hideLoader();
          break;
        default:
          this.router.navigate(['/landing-page']);
          this.sharedService.hideLoader();
          break;
      }
      return true;
    } catch (error) {
      this.handleError(error);
      return false;
    }
  }

  private setSessionData(idToken: any) {
    sessionStorage.setItem('auth', String(idToken));
    sessionStorage.setItem(
      'username',
      `${idToken?.payload['given_name']} ${idToken?.payload['family_name']}`
    );
    sessionStorage.setItem('email', String(idToken?.payload['email']));
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem(
      'role',
      String(idToken?.payload['cognito:groups'][0])
    );
    this.isLoggedIn = true;
  }

  private handleLogout() {
    this.sharedService.hideLoader();
    this.isLoggedIn = false;
    sessionStorage.setItem('isLoggedIn', 'false');
  }

  async signIn(username: string, password: string): Promise<boolean> {
    try {
      // Check if there's anything in localStorage first
      if (localStorage.length > 0) {
        // Clear all items in localStorage
        localStorage.clear();
      }

      this.sharedService.showLoader('Signing In...');
      const { nextStep } = await signIn({
        username: username,
        password: password,
      });
      console.log(nextStep);

      if (nextStep.signInStep === 'DONE') {
        this.currentSession();
        return true; // Indicate success
      }

      if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        this.sharedService.hideLoader();
        // Resend sign up code to the registered user
        const { destination, deliveryMedium } = await resendSignUpCode({
          username,
        });
        this.verifyEmail(username, destination as string);
        return false;
      }
    } catch (error) {
      this.sharedService.hideLoader();
      if (
        error ===
        'UserAlreadyAuthenticatedException: There is already a signed in user.'
      ) {
      } else {
        this.handleError(error);
      }
      return false;
    }
    return false; // Default to false if no condition matches
  }

  async signUp(data: any): Promise<boolean> {
    try {
      // Sign up using an email address
      const { nextStep: signUpNextStep } = await signUp({
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

      if (signUpNextStep.signUpStep === 'DONE') {
        this.signIn(data.email, data.password);
        return true;
      }

      if (signUpNextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        this.verifyEmail(
          data.email,
          signUpNextStep.codeDeliveryDetails.destination as string
        );
        return false;
      }
    } catch (error) {
      this.handleError(error);
      return false;
    }
    return false;
  }

  async confirmSignUp(username: string, code: string): Promise<boolean> {
    try {
      // Confirm sign up with the OTP received
      const { nextStep: confirmSignUpNextStep } = await confirmSignUp({
        username: username,
        confirmationCode: code,
      });

      if (confirmSignUpNextStep.signUpStep === 'DONE') {
        console.log(`SignUp Complete`);
        this.dialog
          .open(SuccessMessageDialogComponent, {
            data: { message: 'SignUp Completed!' },
          })
          .afterClosed()
          .subscribe(() => {
            this.dialog.open(SigninComponent).afterClosed();
          });
        return true;
      }
    } catch (error) {
      this.handleError(error);
      return false;
    }
    return false;
  }

  async logout() {
    try {
      await signOut({ global: true });
      sessionStorage.clear();
      localStorage.clear();
      this.router.navigate(['landing-page']);
    } catch (error) {
      this.handleError(error);
    }
  }

  async verifyEmail(username: string, destination: string) {
    this.dialog
      .open(VerifyAccountComponent, {
        data: { destination: destination, username: username },
      })
      .afterClosed()
      .subscribe();
  }

  async resendSignUpCode(username: string): Promise<ResendSignUpCodeOutput> {
    return await resendSignUpCode({
      username,
    });
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const isLoggedIn = sessionStorage.getItem('isLoggedIn');
      const auth = sessionStorage.getItem('auth');
      if (!isLoggedIn || !auth) return false;

      const { accessToken, idToken } = (await fetchAuthSession()).tokens ?? {};
      return !!accessToken && !!idToken;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  public handleError(error: any) {
    console.error(error);
    return this.dialog
      .open(ErrorMessageDialogComponent, {
        data: { message: String(error) },
      })
      .afterClosed();
  }

  public handleSuccess(success: any) {
    console.log(success);
    return this.dialog
      .open(SuccessMessageDialogComponent, {
        data: { message: String(success) },
      })
      .afterClosed();
  }
}
