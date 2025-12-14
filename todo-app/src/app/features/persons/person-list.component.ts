import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';

import { PersonService } from '../../core/services/person.service';
import { Person } from '../../core/models/person.model';
import { PersonDialogComponent } from './person-dialog.component';
import { SmartTableModule } from '../../shared/smart-table/smart-table.module';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-person-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SmartTableModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatCardModule,
    TranslocoModule
  ],
  templateUrl: './person-list.component.html',
  styleUrl: './person-list.component.scss'
})
export class PersonListComponent implements OnInit {
  source: Person[] = [];
  settings = {
    actions: {
      custom: [
        { name: 'edit', icon: 'edit', color: 'primary' },
        { name: 'delete', icon: 'delete', color: 'warn' }
      ],
      position: 'right' as const
    },
    columns: {},
    noDataMessage: 'persons.noData'
  };

  pageIndex = 0;
  pageSize = 5;
  total = 0;
  search = '';
  searchEmail = '';
  loading = false;
  personsCache: Person[] = [];

  constructor(
    private readonly personService: PersonService,
    private readonly dialog: MatDialog,
    private readonly transloco: TranslocoService
  ) {}

  ngOnInit(): void {
    this.settings = {
      ...this.settings,
      columns: {
        name: {
          title: 'persons.columns.name',
          type: 'avatar' as const,
          field: 'name',
          valuePrepareFunction: (value: string, row: Person) => this.highlightPerson(value, row)
        },
        email: {
          title: 'persons.columns.email',
          valuePrepareFunction: (value: string) => this.highlightEmail(value)
        },
        phone: { title: 'persons.columns.phone' }
      }
    };
    this.loadPersons();
  }

  loadPersons(): void {
    this.loading = true;
    this.personService
      .list({ all: true })
      .subscribe((result) => {
        const term = this.search.trim().toLowerCase();
        const emailTerm = this.searchEmail.trim().toLowerCase();

        const filtered = result.data.filter((p) => {
          const name = p.name?.toLowerCase() ?? '';
          const email = p.email?.toLowerCase() ?? '';
          const matchesTerm = !term || name.includes(term) || email.includes(term);
          const matchesEmail = !emailTerm || email.includes(emailTerm) || name.includes(emailTerm);
          return matchesTerm && matchesEmail;
        });

        const totalPages = Math.max(Math.ceil(filtered.length / this.pageSize) - 1, 0);
        if (this.pageIndex > totalPages) {
          this.pageIndex = totalPages;
        }
        const start = this.pageIndex * this.pageSize;
        const end = start + this.pageSize;

        this.personsCache = filtered;
        this.total = filtered.length;
        this.source = filtered.slice(start, end);
        this.loading = false;
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPersons();
  }

  openDialog(person?: Person): void {
    this.personService.list({ page: 1, limit: 1000 }).subscribe((all) => {
      const dialogRef = this.dialog.open(PersonDialogComponent, {
        width: '520px',
        data: { person, existing: all.data }
      });

      dialogRef.afterClosed().subscribe((payload: Person | undefined) => {
        if (!payload) return;
        if (payload.id) {
          this.personService.update(payload).subscribe(() => this.loadPersons());
        } else {
          this.personService.create(payload).subscribe(() => this.loadPersons());
        }
      });
    });
  }

  onCustom(event: any): void {
    const person: Person = event.data;
    if (event.action === 'edit') {
      this.openDialog(person);
    }
    if (
      event.action === 'delete' &&
      confirm(this.transloco.translate('persons.confirmDelete', { name: person.name }))
    ) {
      this.personService.delete(person.id!).subscribe(() => this.loadPersons());
    }
  }

  applySearch(): void {
    this.pageIndex = 0;
    this.loadPersons();
  }

  private highlightPerson(value: string, row: Person): string {
    return this.highlightText(value ?? this.resolveFallback(row), [this.search, this.searchEmail]);
  }

  private highlightEmail(value: string): string {
    return this.highlightText(value, [this.search, this.searchEmail]);
  }

  private highlightText(text: string | undefined, terms: string[]): string {
    if (!text) return '';
    const activeTerms = terms.map((t) => t.trim()).filter(Boolean);
    if (!activeTerms.length) return text;
    return activeTerms.reduce((acc, term) => {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return acc.replace(new RegExp(escaped, 'gi'), (match) => `<mark class="highlight-mark">${match}</mark>`);
    }, text);
  }

  private resolveFallback(row: Person): string {
    return row.name ?? '';
  }
}
