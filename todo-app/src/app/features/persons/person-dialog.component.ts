import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

import { Person } from '../../core/models/person.model';
import { minTrimmedLengthValidator, uniqueNameValidator } from '../../shared/validators';

export interface PersonDialogData {
  person?: Person;
  existing: Person[];
}

@Component({
  selector: 'app-person-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './person-dialog.component.html',
  styleUrl: './person-dialog.component.scss'
})
export class PersonDialogComponent {
  form = this.fb.group({
    name: [
      this.data.person?.name ?? '',
      [Validators.required, minTrimmedLengthValidator(3), uniqueNameValidator(this.data.existing, this.data.person?.id)]
    ],
    email: [this.data.person?.email ?? '', [Validators.required, Validators.email]],
    phone: [this.data.person?.phone ?? '', [Validators.required, minTrimmedLengthValidator(3)]]
  });

  constructor(
    private readonly fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: PersonDialogData,
    private readonly dialogRef: MatDialogRef<PersonDialogComponent>
  ) {}

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload: Person = {
      ...this.data.person,
      ...this.form.value
    };
    this.dialogRef.close(payload);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
