import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthServiceService } from '../../../../auth/auth-service.service';

@Component({
  selector: 'app-message',
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css',
})
export class MessageComponent implements OnInit {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly authService = inject(AuthServiceService);
  txnid: string = '';
  refno: string = '';
  status: string = '';
  message: string = '';
  digest: string = '';

  constructor() {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.txnid = params['txnid'] || '';
      this.refno = params['refno'] || '';
      this.status = params['status'] || '';
      this.message = decodeURIComponent(params['message'] || '');
      this.digest = params['digest'] || '';
    });
  }

  getStatusText(): string {
    switch (this.status) {
      case 'S':
        return 'Success';
      case 'F':
        return 'Failed';
      case 'P':
        return 'Pending';
      case 'U':
        return 'Unknown';
      case 'V':
        return 'Void';
      default:
        return 'Unknown';
    }
  }

  getStatusIcon(): string {
    switch (this.status) {
      case 'S':
        return 'check_circle';
      case 'F':
        return 'error';
      case 'P':
        return 'schedule';
      case 'U':
        return 'help';
      case 'V':
        return 'cancel';
      default:
        return 'help';
    }
  }

  getStatusColor(): 'primary' | 'accent' | 'warn' | undefined {
    switch (this.status) {
      case 'S':
        return 'primary';
      case 'F':
        return 'warn';
      case 'P':
        return 'accent';
      default:
        return undefined;
    }
  }

  goToLandingOnClick() {
    this.authService.logout();
    this.router.navigate(['/landing-page']);
  }
}
