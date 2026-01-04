import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function disallowCharacters(): (control: AbstractControl) => ValidationErrors | null {
  const regex = /javascript:|data:|vbscript:|on\w+\s*=|style\s*=|alert\s*\(|confirm\s*\(|prompt\s*\(|eval\s*\(|<script|<iframe|<object|<embed/i;
  
  return (control: AbstractControl): ValidationErrors | null => {
    return regex.test(control.value || '') ? { disallowedCharacters: true } : null;
  };
}

export function allowMax100(): (control: AbstractControl) => ValidationErrors | null {
  const regex = /^.{1,100}$/;
  
  return (control: AbstractControl): ValidationErrors | null => {
    return !regex.test(control.value || '') ? { notMax100: true } : null;
  };
}

export function allowMax6(): (control: AbstractControl) => ValidationErrors | null {
  const regex = /^.{1,6}$/;
  
  return (control: AbstractControl): ValidationErrors | null => {
    return !regex.test(control.value || '') ? { notMax6: true } : null;
  };
}

export function allowOnlyNumeric(): (control: AbstractControl) => ValidationErrors | null {
  const regex = /^[0-9]+$/;
  
  return (control: AbstractControl): ValidationErrors | null => {
    return !regex.test(control.value || '') ? { notNumeric: true } : null;
  };
}

export function emailValidator(): (control: AbstractControl) => ValidationErrors | null {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return (control: AbstractControl): ValidationErrors | null => {
    return !regex.test(control.value || '') ? { invalidEmailAddress: true } : null;
  };
}

export function minimumAge(): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const birthDate = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age < 18 ? { underAge: true } : null;
  };
}

export function hasUppercase(): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const hasUppercase = !/[A-Z]/.test(control.value);
    return hasUppercase ? { noUppercase: true } : null;
  };
}

export function hasLowercase(): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const hasLowercase = !/[a-z]/.test(control.value);
    return hasLowercase ? { noLowercase: true } : null;
  };
}

export function hasNumber(): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const hasNumber = !/[0-9]/.test(control.value);
    return hasNumber ? { noNumber: true } : null;
  };
}

export function hasSpecialCharacter(): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const hasSpecialCharacter = !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(control.value);
    return hasSpecialCharacter ? { noSpecialCharacter: true } : null;
  };
}

export function hasMinimumLength(): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const hasMinimumLength = control.value && control.value.length >= 8;
    return !hasMinimumLength ? { noMinimumLength: true } : null;
  };
}

export function isMatch(passwordControl: AbstractControl): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control || !passwordControl) {
      return null;
    }

    const password = passwordControl.value;
    const confirmPassword = control.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { isNotMatch: true };
  };
}