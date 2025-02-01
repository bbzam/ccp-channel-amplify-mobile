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
    if (foundCode.isUsed) {
      return { valid: false, message: 'This code has already been isUsed' };
    }
    // Mark code as isUsed
    foundCode.isUsed = true;
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
      foundCode.isUsed = false;
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
