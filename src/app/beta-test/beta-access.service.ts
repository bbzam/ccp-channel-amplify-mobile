import { Injectable } from '@angular/core';
import { BetaAccessCode } from './beta-access.model';
import { betaCodesDB } from './beta-access-db';

@Injectable({
  providedIn: 'root',
})
export class BetaAccessService {
  private betaCodes: BetaAccessCode[] = betaCodesDB;

  async validateCode(
    code: string
  ): Promise<{ valid: boolean; message: string }> {
    const foundCode = this.betaCodes.find((item) => item.code === code);

    if (!foundCode) {
      return { valid: false, message: 'Invalid beta access code' };
    }

    if (foundCode.used) {
      return { valid: false, message: 'This code has already been used' };
    }

    // Mark code as used
    foundCode.used = true;
    foundCode.usedAt = new Date();

    // Update the original database
    const index = this.betaCodes.findIndex((item) => item.code === code);
    if (index !== -1) {
      betaCodesDB[index] = foundCode;
    }

    return { valid: true, message: 'Code validated successfully' };
  }

  // Optional: Method to reset a code (for testing purposes)
  resetCode(code: string): void {
    const foundCode = this.betaCodes.find((item) => item.code === code);
    if (foundCode) {
      foundCode.used = false;
      foundCode.usedAt = null;

      // Update the original database
      const index = this.betaCodes.findIndex((item) => item.code === code);
      if (index !== -1) {
        betaCodesDB[index] = foundCode;
      }
    }
  }

  // Optional: Method to get all codes (for admin purposes)
  getAllCodes(): BetaAccessCode[] {
    return [...this.betaCodes];
  }
}
