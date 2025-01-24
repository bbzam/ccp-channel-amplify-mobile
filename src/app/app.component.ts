import {
  Component,
  ElementRef,
  inject,
  OnInit,
  Renderer2,
} from '@angular/core';
import { MainLayoutComponent } from './core/main-layout/main-layout.component';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import {
  AmplifyAuthenticatorModule,
  AuthenticatorService,
} from '@aws-amplify/ui-angular';
import { ContentCuratorComponent } from './features/content-curator/content-curator.component';
import { Router } from '@angular/router';
import { SubscriberComponent } from './features/subscriber/subscriber/subscriber.component';
import { PublicViewComponent } from './features/public-view/public-view/public-view.component';
import { AuthServiceService } from './auth/auth-service.service';
import { ItAdminComponent } from './features/IT-admin/it-admin/it-admin.component';
import { SuperAdminComponent } from './features/super-admin/super-admin/super-admin.component';

@Component({
  selector: 'app-root',
  imports: [
    MainLayoutComponent,
    AmplifyAuthenticatorModule,
    ContentCuratorComponent,
    SubscriberComponent,
    PublicViewComponent,
    ItAdminComponent,
    SuperAdminComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'CCP Channel';
  readonly authenticator = inject(AuthenticatorService);
  readonly renderer = inject(Renderer2);
  readonly elementRef = inject(ElementRef);
  readonly router = inject(Router);
  readonly authService = inject(AuthServiceService);

  ngOnInit(): void {
    this.handleRoleBasedRedirection();
  }

  constructor() {
    Amplify.configure(outputs);
  }

  get userRole(): string {
    return String(sessionStorage.getItem('role'));
  }

  private handleRoleBasedRedirection() {
    switch (this.userRole) {
      case 'USER':
        this.router.navigate(['/subscriber']);
        break;
      case 'CONTENT_CREATOR':
        this.router.navigate(['/content-curator']);
        break;
      case 'SUBSCRIBER':
        this.router.navigate(['/subscriber']);
        break;
      case 'IT_ADMIN':
        this.router.navigate(['/it-admin']);
        break;
      case 'SUPER_ADMIN':
        this.router.navigate(['/super-admin']);
        break;
      default:
        this.authService.logout();
        this.router.navigate(['/landing-page']);
    }
  }
}
