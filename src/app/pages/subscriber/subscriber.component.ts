import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../core/header/header.component';
import { FooterComponent } from '../../core/footer/footer.component';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-subscriber',
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './subscriber.component.html',
  styleUrl: './subscriber.component.css'
})
export class SubscriberComponent {
  private authService = inject(AuthService);
  
  get username(): string {
    return sessionStorage.getItem('username') || 'Subscriber';
  }
  
  get role(): string {
    return sessionStorage.getItem('role') || 'SUBSCRIBER';
  }
  
  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
    }
  }
}