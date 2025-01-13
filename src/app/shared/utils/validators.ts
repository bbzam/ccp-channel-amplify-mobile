import { AbstractControl, ValidationErrors } from '@angular/forms';

//validator for disallowing charaters for input fields
export function disallowCharacters(): (
  control: AbstractControl
) => ValidationErrors | null {
  const regex = /[<>'";()]/; // Regex to match any disallowed character

  return (control: AbstractControl): ValidationErrors | null => {
    return regex.test(control.value || '')
      ? { disallowedCharacters: true }
      : null;
  };
}

//validator that will accept max of 50 characters
export function allowMax50(): (
  control: AbstractControl
) => ValidationErrors | null {
  const regex = /^.{1,50}$/; // Regex to accept max of 50 characters

  return (control: AbstractControl): ValidationErrors | null => {
    return !regex.test(control.value || '') ? { notMax50: true } : null;
  };
}

//validator that will accept max of 100 characters
export function allowMax100(): (
  control: AbstractControl
) => ValidationErrors | null {
  const regex = /^.{1,100}$/; // Regex to accept max of 100 characters

  return (control: AbstractControl): ValidationErrors | null => {
    return !regex.test(control.value || '') ? { notMax100: true } : null;
  };
}

//validator that will accept max of 3 characters
export function allowMax3(): (
    control: AbstractControl
  ) => ValidationErrors | null {
    const regex = /^.{1,3}$/; // Regex to accept max of 3 characters
  
    return (control: AbstractControl): ValidationErrors | null => {
      return !regex.test(control.value || '') ? { notMax3: true } : null;
    };
}

//validator for accepting only numbers
export function allowOnlyNumeric(): (
  control: AbstractControl
) => ValidationErrors | null {
  const regex = /^\d+$/; // Regex to accept only numeric

  return (control: AbstractControl): ValidationErrors | null => {
    return !regex.test(control.value || '') ? { notNumeric: true } : null;
  };
}

//validator for email
export function emailValidator(): (
  control: AbstractControl
) => ValidationErrors | null {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex to accept only alpha and '-'. max of 100 characters

  return (control: AbstractControl): ValidationErrors | null => {
    return !regex.test(control.value || '')
      ? { invalidEmailAddress: true }
      : null;
  };
}

//validator for cellphone number that will accept only numerical, minimum of 10, and max of 12.
export function cellphoneNumberValidator(): (
  control: AbstractControl
) => ValidationErrors | null {
  const regex = /^0[0-9]{10}$/; // Regex to accept only alpha and '-'. max of 100 characters

  return (control: AbstractControl): ValidationErrors | null => {
    return !regex.test(control.value || '')
      ? { invalidCellphoneNumber: true }
      : null;
  };
}

//validator for password containing a mix of uppercase and lowercase letters, numbers, and special characters
export function passwordValidator(): (
  control: AbstractControl
) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    // Regular expressions for password strength criteria
    const hasUppercase = /[A-Z]/.test(control.value);
    const hasLowercase = /[a-z]/.test(control.value);
    const hasNumber = /[0-9]/.test(control.value);
    const hasSpecialCharacter = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
      control.value
    );
    const hasMinimumLength = control.value && control.value.length >= 8;

    const isValid =
      hasUppercase &&
      hasLowercase &&
      hasNumber &&
      hasSpecialCharacter &&
      hasMinimumLength;

    return isValid ? { invalidPassowrd: true } : null;
  };
}

//validator to check if has uppercase
export function hasUppercase(): (
  control: AbstractControl
) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const hasUppercase = !/[A-Z]/.test(control.value);

    return hasUppercase ? { noUppercase: true } : null;
  };
}

//validator to check if has lowercase
export function hasLowercase(): (
  control: AbstractControl
) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const hasLowercase = !/[a-z]/.test(control.value);

    return hasLowercase ? { noLowercase: true } : null;
  };
}

//validator to check if has number
export function hasNumber(): (
  control: AbstractControl
) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const hasNumber = !/[0-9]/.test(control.value);

    return hasNumber ? { noNumber: true } : null;
  };
}

//validator to check if has special character
export function hasSpecialCharacter(): (
  control: AbstractControl
) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const hasSpecialCharacter = !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
      control.value
    );

    return hasSpecialCharacter ? { noSpecialCharacter: true } : null;
  };
}

//validator to check if has minimum length
export function hasMinimumLength(): (
  control: AbstractControl
) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const hasMinimumLength = control.value && control.value.length >= 8;

    return !hasMinimumLength ? { noMinimumLength: true } : null;
  };
}

//validator for matching values
export function isMatch(value: string): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
        const isNotMatch = control.value !== value;
    
        return isNotMatch ? { isNotMatch: true } : null;
      };
}