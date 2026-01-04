import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../core/header/header.component';
import { FooterComponent } from '../../core/footer/footer.component';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-user',
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
  private authService = inject(AuthService);
  
  get username(): string {
    return sessionStorage.getItem('username') || 'User';
  }
  
  get role(): string {
    return sessionStorage.getItem('role') || 'USER';
  }
  
  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
    }
  }
}