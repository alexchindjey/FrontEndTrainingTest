import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, startWith } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslocoModule } from '@ngneat/transloco';

import { Todo } from '../../core/models/todo.model';
import { TodoLabel, TODO_LABELS } from '../../core/models/todo-label.enum';
import { TodoPriority, TODO_PRIORITIES } from '../../core/models/todo-priority.enum';
import { Person } from '../../core/models/person.model';
import { minTrimmedLengthValidator } from '../../shared/validators';

export interface TodoDialogData {
  todo?: Todo;
  persons: Person[];
}

@Component({
  selector: 'app-todo-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    TranslocoModule
  ],
  templateUrl: './todo-dialog.component.html',
  styleUrl: './todo-dialog.component.scss'
})
export class TodoDialogComponent implements OnInit {
  readonly priorities = TODO_PRIORITIES;
  readonly labels = TODO_LABELS;
  filteredPersons$!: Observable<Person[]>;

  form!: FormGroup<{
    title: FormControl<string>;
    person: FormControl<Person | null>;
    startDate: FormControl<string>;
    endDate: FormControl<string | null>;
    completed: FormControl<boolean>;
    priority: FormControl<TodoPriority>;
    labels: FormControl<TodoLabel[]>;
    description: FormControl<string>;
  }>;

  constructor(
    private readonly fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: TodoDialogData,
    private readonly dialogRef: MatDialogRef<TodoDialogComponent>
  ) {
    this.form = this.fb.group({
      title: this.fb.nonNullable.control(this.data.todo?.title ?? '', [
        Validators.required,
        minTrimmedLengthValidator(3)
      ]),
      person: this.fb.control<Person | null>(this.data.todo?.person ?? null, Validators.required),
      startDate: this.fb.nonNullable.control(this.data.todo?.startDate ?? this.todayString(), Validators.required),
      endDate: this.fb.control<string | null>(
        { value: this.data.todo?.endDate ?? null, disabled: this.data.todo?.completed ?? false }
      ),
      completed: this.fb.nonNullable.control(this.data.todo?.completed ?? false),
      priority: this.fb.nonNullable.control(this.data.todo?.priority ?? ('Moyen' as TodoPriority), Validators.required),
      labels: this.fb.nonNullable.control<TodoLabel[]>(this.data.todo?.labels ?? []),
      description: this.fb.nonNullable.control(this.data.todo?.description ?? '')
    });
  }

  ngOnInit(): void {
    this.filteredPersons$ = this.form.controls.person.valueChanges.pipe(
      startWith(this.form.controls.person.value),
      map((value) => this.filterPersons(value))
    );

    this.form.controls.completed.valueChanges.subscribe((completed) => {
      const endDateControl = this.form.controls.endDate;
      if (completed) {
        if (!endDateControl.value) {
          endDateControl.setValue(this.todayString());
        }
        endDateControl.disable({ emitEvent: false });
      } else {
        endDateControl.enable({ emitEvent: false });
      }
    });
  }

  displayPerson(person: Person | string | null): string {
    if (typeof person === 'string') return person;
    return person ? person.name : '';
  }

  filterPersons(value: string | Person | null): Person[] {
    const search = (typeof value === 'string' ? value : value?.name ?? '').toLowerCase();
    return this.data.persons.filter((p) => p.name.toLowerCase().includes(search));
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { person, ...raw } = this.form.getRawValue();
    if (!person || !person.id) {
      this.form.controls.person.setErrors({ required: true });
      return;
    }
    const endDate = raw.completed ? raw.endDate ?? this.todayString() : raw.endDate ?? null;
    const payload: Todo = {
      ...this.data.todo,
      ...raw,
      personId: person?.id ?? 0,
      person: person ?? undefined,
      endDate
    };

    this.dialogRef.close(payload);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private todayString(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
