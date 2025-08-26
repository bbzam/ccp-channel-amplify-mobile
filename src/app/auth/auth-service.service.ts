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
  confirmSignIn,
  resetPassword,
  confirmResetPassword,
  updatePassword,
} from 'aws-amplify/auth';
import { VerifyAccountComponent } from './components/verify-account/verify-account.component';
import { SharedService } from '../shared/shared.service';
import { SigninComponent } from './components/signin/signin.component';
import { ForcedChangePasswordComponent } from './components/forced-change-password/forced-change-password.component';
import { ConfirmationDialogComponent } from '../shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { FeaturesService } from '../features/features.service';
import { ReminderDialogComponent } from '../shared/dialogs/reminder-dialog/reminder-dialog.component';
import { generateClient } from 'aws-amplify/api';
import { Schema } from '../../../amplify/data/resource';

interface CognitoIdTokenPayload {
  'cognito:groups'?: string[];
  'custom:paidUntil'?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  isLoggedIn!: boolean;
  readonly dialog = inject(MatDialog);
  readonly router = inject(Router);
  readonly sharedService = inject(SharedService);
  readonly featuresService = inject(FeaturesService);
  private readonly client = generateClient<Schema>();

  constructor() {}

  async currentSession() {
    try {
      const { accessToken, idToken } = (await fetchAuthSession()).tokens ?? {};
      const payload = idToken?.payload as CognitoIdTokenPayload;
      const userRole = payload?.['cognito:groups']?.[0];
      const paidUntil = String(payload?.['custom:paidUntil']);
      const email = String(idToken?.payload['email']);

      console.log(payload?.['custom:paidUntil']);

      if (!accessToken || !idToken) {
        this.handleLogout();
        return false;
      }
      this.setSessionData(idToken);
      switch (userRole) {
        case 'USER':
          this.router.navigate(['/user'], {
            queryParams: { renew: paidUntil ? true : false },
          });
          this.sharedService.hideLoader();
          break;
        case 'SUBSCRIBER':
          this.checkSubscriptionExpiry(paidUntil, email);
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

  private checkSubscriptionExpiry(paidUntil: string, email: string): void {
    const paidUntilDate = new Date(paidUntil);
    const daysDiff = Math.ceil(
      (paidUntilDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff > 0 && daysDiff < 3) {
      console.log(`You have ${daysDiff} days remaining on your current plan.`);
      this.dialog
        .open(ReminderDialogComponent, {
          data: {
            type: 'warning',
            title: 'Subscription Reminder',
            primaryMessage: 'Your subscription expires soon!',
            secondaryMessage: `You have <strong>${daysDiff} days</strong> remaining on your current plan.`,
            actionMessage:
              'Renew now to continue enjoying uninterrupted access to all features.',
            cancelText: 'Not now',
            actionText: 'Renew Subscription',
          },
          disableClose: true,
        })
        .afterClosed()
        .subscribe((close: boolean) => {
          if (!close) {
            this.router.navigate(['/subscriber']);
          }
        });
    } else if (daysDiff > 3) {
      this.router.navigate(['/subscriber']);
    } else if (daysDiff <= 0) {
      this.client.mutations.unsubscribeUser({
        email: email,
      });
      this.logout();
      this.dialog.open(ReminderDialogComponent, {
        data: {
          type: 'error',
          title: 'Subscription Expired',
          primaryMessage: 'Your subscription has expired!',
          secondaryMessage:
            'Please renew your subscription to continue enjoying all features.',
          actionMessage:
            'Login and renew now to continue enjoying uninterrupted access.',
        },
        disableClose: true,
      });
    }
    this.sharedService.hideLoader();
  }

  private setSessionData(idToken: any) {
    sessionStorage.setItem('userId', String(idToken?.payload['sub']));
    sessionStorage.setItem('auth', String(idToken) || '');
    sessionStorage.setItem(
      'username',
      `${idToken?.payload['given_name'] || ''} ${
        idToken?.payload['family_name'] || ''
      }`
    );
    sessionStorage.setItem('email', String(idToken?.payload['email']));
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem(
      'role',
      String(idToken?.payload?.['cognito:groups']?.[0] || '')
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

      if (
        nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED'
      ) {
        this.sharedService.hideLoader();
        this.dialog
          .open(ForcedChangePasswordComponent, { panelClass: 'dialog' })
          .afterClosed()
          .subscribe((data) => {
            if (data) {
              this.confirmNewPassword(data);
            }
          });
      }
    } catch (error) {
      this.sharedService.hideLoader();
      this.handleError(
        'Unable to sign in. Please check your email and password, then try again.'
      );
      return false;
    }
    return false; // Default to false if no condition matches
  }

  async confirmNewPassword(newPassword: string): Promise<boolean> {
    try {
      const result = await confirmSignIn({ challengeResponse: newPassword });
      if (result.nextStep.signInStep === 'DONE') {
        this.dialog
          .open(SuccessMessageDialogComponent, {
            data: { message: 'Change Password Successful!' },
          })
          .afterClosed()
          .subscribe(() => {
            this.dialog.open(SigninComponent).afterClosed();
          });
        return true;
      }
      this.handleError('Something went wrong. Please try again.');
      return false;
    } catch (error) {
      this.handleError(
        'An error occurred while changing your password. Please try again'
      );
      throw error;
    }
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
        this.dialog
          .open(SuccessMessageDialogComponent, {
            data: { message: 'Sign-up Completed! Please sign in to continue.' },
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

  async resetPassword(username: string): Promise<any> {
    try {
      this.sharedService.showLoader('Sending code to email...');
      // Initiate the password reset
      const { nextStep } = await resetPassword({ username });

      if (nextStep.resetPasswordStep === 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
        this.sharedService.hideLoader();
        return nextStep.resetPasswordStep;
      }
    } catch (error) {
      this.sharedService.hideLoader();
      this.handleError(error);
      throw error;
    } finally {
      this.sharedService.hideLoader();
    }
  }

  async confirmResetPassword(
    username: string,
    newPassword: string,
    confirmationCode: string
  ): Promise<boolean> {
    try {
      this.sharedService.showLoader('Resetting your password...');
      // Confirm the password reset with the code
      await confirmResetPassword({
        username,
        newPassword,
        confirmationCode,
      });

      this.sharedService.hideLoader();
      return true;
    } catch (error) {
      this.sharedService.hideLoader();
      this.handleError(error);
      throw error;
    } finally {
      this.sharedService.hideLoader();
    }
  }

  async updatePassword(data: any): Promise<boolean> {
    try {
      await updatePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });

      this.dialog
        .open(ConfirmationDialogComponent, {
          data: {
            message:
              'Password Updated Successfully! Do you want to log out now?',
          },
        })
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.logout();
          }
        });
      return true;
    } catch (error) {
      this.handleError(error);
      return false;
    }
  }

  async logout() {
    try {
      //signout
      await signOut({ global: true });

      //navigate to landing page
      await this.router.navigate(['landing-page']);

      //clear caches
      this.navigateToLandingPageClean();
    } catch (error) {
      this.handleError(error);
    }
  }

  async navigateToLandingPageClean() {
    try {
      // Clear all storage
      sessionStorage.clear();
      localStorage.clear();

      // Clear service caches and state
      this.isLoggedIn = false;

      // Clear shared service loader state
      this.sharedService.hideLoader();

      // Clear all intervals (simpler approach)
      for (let i = 1; i < 99999; i++) {
        clearInterval(i);
      }

      // Navigate to landing page
      await this.router.navigate(['landing-page']);

      return true;
    } catch (error) {
      this.handleError(error);
      return false;
    }
  }

  async verifyEmail(username: string, destination: string) {
    this.dialog
      .open(VerifyAccountComponent, {
        data: { destination: destination, username: username },
        disableClose: true,
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
      const { accessToken, idToken } = (await fetchAuthSession()).tokens ?? {};
      return !!accessToken && !!idToken;
    } catch (err) {
      return false;
    }
  }

  public handleError(error: any) {
    this.sharedService.hideLoader();
    return this.dialog
      .open(ErrorMessageDialogComponent, {
        data: { message: String(error) },
      })
      .afterClosed();
  }

  public handleSuccess(success: any) {
    this.sharedService.hideLoader();
    return this.dialog
      .open(SuccessMessageDialogComponent, {
        data: { message: String(success) },
      })
      .afterClosed();
  }
}
