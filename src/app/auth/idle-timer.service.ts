import { inject, Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from './auth-service.service';
import { MatDialog } from '@angular/material/dialog';
import { ReminderDialogComponent } from '../shared/dialogs/reminder-dialog/reminder-dialog.component';
import { Hub } from 'aws-amplify/utils';
import { getCurrentUser } from 'aws-amplify/auth';

@Injectable({ providedIn: 'root' })
export class IdleTimerService {
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly authService = inject(AuthServiceService);
  private readonly dialog = inject(MatDialog);
  private timeoutId: any;
  private warningTimeoutId: any;
  private isActive: boolean = false;
  private dialogRef: any;
  private countdownInterval: any;
  private readonly timeoutDuration = 15 * 60 * 1000; // 15 minutes
  private readonly warningDuration = 13 * 60 * 1000; // 13 minutes (2 min warning)

  constructor() {
    console.log('IdleTimerService: Constructor called');
    this.listenForAuthEvents();
  }

  /**
   * Start listening for Cognito auth events
   */
  private listenForAuthEvents() {
    Hub.listen('auth', ({ payload: { event } }) => {
      if (event === 'signedIn') {
        this.start();
      } else if (event === 'signedOut') {
        this.stop();
      }
    });

    // Check authentication status after a short delay
    setTimeout(() => {
      this.checkAuthenticationStatus();
    }, 1000);
  }

  /**
   * Check current authentication status
   */
  private async checkAuthenticationStatus() {
    try {
      console.log('IdleTimerService: Checking authentication status...');
      await getCurrentUser();
      console.log('IdleTimerService: User is authenticated, starting timer');
      this.start();
    } catch (error) {
      console.log('IdleTimerService: User not authenticated, stopping timer');
      this.stop();
    }
  }

  /**
   * Start idle detection
   */
  private start() {
    if (this.isActive) return;
    this.isActive = true;

    this.checkIdleSinceLastSession();
    this.initActivityListeners();
    this.resetTimer();
  }

  /**
   * Stop idle detection
   */
  private stop() {
    this.isActive = false;
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId);
    this.timeoutId = null;
    this.warningTimeoutId = null;
  }

  /**
   * Check on app load if user was inactive for too long
   */
  /**
   * Check on app load if user was inactive for too long
   */
  private async checkIdleSinceLastSession() {
    const lastActivity = parseInt(
      localStorage.getItem('lastActivity') || '0',
      10
    );
    const now = Date.now();
    const idleTime = now - lastActivity;
    // console.log(`IdleTimerService: Last activity was ${idleTime / 1000}s ago`);

    if (lastActivity === 0) {
      // First time login, set current time as last activity
      localStorage.setItem('lastActivity', now.toString());
      return;
    }

    if (idleTime > this.timeoutDuration) {
      console.log('IdleTimerService: User was idle too long, logging out');
      try {
        this.logout();
      } catch (err) {
        console.error('Error signing out:', err);
      }
    }
  }

  /**
   * Initialize DOM activity listeners
   */
  private initActivityListeners() {
    console.log('IdleTimerService: Setting up activity listeners');
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart'];

    events.forEach((event) => {
      document.addEventListener(event, () => this.handleActivity(), true);
    });
  }

  /**
   * Handle user activity - only if authenticated
   */
  async handleActivity() {
    // console.log('IdleTimerService: Activity detected');
    if (await this.authService.isAuthenticated()) {
      localStorage.setItem('lastActivity', Date.now().toString());
      this.resetTimer();
    }
  }

  /**
   * Determine if the user is actively watching a video
   */
  private isWatchingVideo(): boolean {
    const video = document.querySelector('video');
    const watching = !!(
      video &&
      !video.paused &&
      !video.ended &&
      video.readyState >= 2
    );
    // if (watching)
    //   console.log('IdleTimerService: User is watching video, skipping timer');
    return watching;
  }

  /**
   * Reset or start the inactivity timer
   */
  private resetTimer() {
    // console.log('IdleTimerService: Resetting timer');
    if (this.isWatchingVideo()) return;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
    }

    // Start countdown logging
    const startTime = Date.now();
    const countdownInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = (this.timeoutDuration - elapsed) / 1000;
      if (remaining > 0) {
        // console.log(
        //   `IdleTimerService: ${remaining.toFixed(0)}s remaining until logout`
        // );
      } else {
        clearInterval(countdownInterval);
      }
    }, 1000);

    this.ngZone.runOutsideAngular(() => {
      this.warningTimeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          console.log(
            'IdleTimerService: Warning timeout reached, showing dialog'
          );
          this.showWarningDialog();
        });
      }, this.warningDuration);

      this.timeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          console.log('IdleTimerService: Timeout reached, logging out');
          this.logout();
        });
      }, this.timeoutDuration);
    });
  }

  /**
   * Show warning dialog with countdown
   */
  private showWarningDialog() {
    console.log('IdleTimerService: Opening warning dialog');
    const warningTime = (this.timeoutDuration - this.warningDuration) / 1000; // 15 seconds
    let remainingSeconds = warningTime;

    this.dialogRef = this.dialog.open(ReminderDialogComponent, {
      data: {
        type: 'warning',
        title: 'Session Timeout Warning',
        primaryMessage: `You will be logged out in ${remainingSeconds} seconds!`,
        secondaryMessage: 'Click "Stay Logged In" to continue your session.',
        actionMessage: 'Your session will expire due to inactivity.',
        cancelText: 'Logout Now',
        actionText: 'Stay Logged In',
        actionType: 'SESSION_WARNING',
      },
      disableClose: true,
    });

    this.countdownInterval = setInterval(() => {
      remainingSeconds--;
      if (remainingSeconds > 0 && this.dialogRef) {
        this.dialogRef.componentInstance.primaryMessage = `You will be logged out in ${remainingSeconds} seconds!`;
      } else {
        clearInterval(this.countdownInterval);
      }
    }, 1000);

    this.dialogRef.afterClosed().subscribe((stayLoggedIn: boolean) => {
      clearInterval(this.countdownInterval);
      if (stayLoggedIn) {
        this.handleActivity();
      } else {
        this.logout();
      }
    });
  }

  /**
   * Log out user
   */
  private async logout() {
    console.log('IdleTimerService: Logging out user');
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
    try {
      this.authService.logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }
}
