import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function minTrimmedLengthValidator(minLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toString().trim();
    return value.length >= minLength ? null : { minTrimmedLength: { requiredLength: minLength, actualLength: value.length } };
  };
}

export function uniqueNameValidator(items: { id?: number; name: string }[], currentId?: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toString().trim().toLowerCase();
    if (!value) return null;
    const conflict = items.some((item) => (item.id ?? -1) !== (currentId ?? -1) && item.name.trim().toLowerCase() === value);
    return conflict ? { nameTaken: true } : null;
  };
}
