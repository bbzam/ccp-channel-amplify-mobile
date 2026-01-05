import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GeolocationGuard implements CanActivate {

  constructor(private router: Router) {}

  async canActivate(): Promise<boolean> {
    try {
      const country = await this.getUserCountry();
      
      if (country === 'PH') {
        return true;
      }
      
      this.router.navigate(['/geo-blocked']);
      return false;
    } catch (error) {
      console.error('Geolocation check failed:', error);
      // Allow access if geolocation fails (fallback)
      return true;
    }
  }

  private async getUserCountry(): Promise<string> {
    try {
      // Use a free IP geolocation service
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return data.country_code;
    } catch (error) {
      // Fallback to another service
      try {
        const response = await fetch('https://api.country.is/');
        const data = await response.json();
        return data.country;
      } catch (fallbackError) {
        throw new Error('Unable to determine location');
      }
    }
  }
}