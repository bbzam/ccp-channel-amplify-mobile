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
} from 'aws-amplify/auth';
import { VerifyAccountComponent } from './components/verify-account/verify-account.component';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  isLoggedIn!: boolean;
  readonly dialog = inject(MatDialog);
  readonly router = inject(Router);

  constructor() {}

  async currentSession() {
    try {
      const { accessToken, idToken } = (await fetchAuthSession()).tokens ?? {};
      console.log(idToken);
      if (accessToken && idToken) {
        sessionStorage.setItem('auth', String(idToken));
        sessionStorage.setItem(
          'username',
          String(
            idToken?.payload['given_name'] +
              ' ' +
              String(idToken?.payload['family_name'])
          )
        );
        sessionStorage.setItem('email', String(idToken?.payload['email']));
        sessionStorage.setItem('isLoggedIn', 'true');
        this.isLoggedIn = true;
        this.router.navigate(['subscriber']);
      } else {
        this.isLoggedIn = false;
        sessionStorage.setItem('isLoggedIn', 'false');
      }
    } catch (error) {
      console.log(error);
      this.dialog
        .open(ErrorMessageDialogComponent, { data: { message: String(error) } })
        .afterClosed()
        .subscribe((data) => {});
    }
  }

  async signIn(username: string, password: string): Promise<boolean> {
    try {
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
        // Resend sign up code to the registered user
        const { destination, deliveryMedium } = await resendSignUpCode({
          username,
        });
        this.verifyEmail(username, destination as string);
        return false;
      }
    } catch (error) {
      console.log(error);
      this.dialog
        .open(ErrorMessageDialogComponent, { data: { message: String(error) } })
        .afterClosed()
        .subscribe(() => {});
      throw error; // Re-throw to let the caller handle it
    }
    return false; // Default to false if no condition matches
  }

  async signUp(data: any): Promise<boolean> {
    try {
      console.log(data);
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
        console.log(`SignUp Complete`);
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
      console.log(error);
      this.dialog
        .open(ErrorMessageDialogComponent, { data: { message: String(error) } })
        .afterClosed()
        .subscribe((data) => {});
      throw error;
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
          .subscribe((data) => {});
        return true;
      }
    } catch (error) {
      console.log(error);
      this.dialog
        .open(ErrorMessageDialogComponent, { data: { message: String(error) } })
        .afterClosed()
        .subscribe((data) => {});
    }
    return false;
  }

  async logout() {
    try {
      const logout = await signOut({ global: true });
      sessionStorage.clear();
      localStorage.clear();
      this.router.navigate(['landing-page']);
    } catch (error) {
      console.log(error);
    }
  }

  async verifyEmail(username: string, destination: string) {
    this.dialog
      .open(VerifyAccountComponent, {
        data: { destination: destination, username: username },
      })
      .afterClosed()
      .subscribe((isSuccess) => {});
  }

  async resendSignUpCode(username: string) {
    // Resend sign up code to the registered user
    const { destination, deliveryMedium } = await resendSignUpCode({
      username,
    });
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      if (sessionStorage.getItem('isLoggedIn') == 'true') {
        return true;
      } else if (
        sessionStorage.getItem('isLoggedIn') == 'false' ||
        sessionStorage.getItem('isLoggedIn') == null
      ) {
        return false;
      } else {
        const { accessToken, idToken } =
          (await fetchAuthSession()).tokens ?? {};
        return !!accessToken && !!idToken;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
