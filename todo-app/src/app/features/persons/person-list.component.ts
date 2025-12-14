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
import { LocalDataSource, Ng2SmartTableModule } from 'ng2-smart-table';

import { PersonService } from '../../core/services/person.service';
import { Person } from '../../core/models/person.model';
import { PersonDialogComponent } from './person-dialog.component';

@Component({
  selector: 'app-person-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Ng2SmartTableModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatCardModule
  ],
  templateUrl: './person-list.component.html',
  styleUrl: './person-list.component.scss'
})
export class PersonListComponent implements OnInit {
  source = new LocalDataSource();
  settings = {
    actions: {
      add: false,
      edit: false,
      delete: false,
      custom: [
        { name: 'edit', title: '<i class=\"material-icons text-primary\">edit</i>' },
        { name: 'delete', title: '<i class=\"material-icons text-warn\">delete</i>' }
      ],
      position: 'right'
    },
    columns: {
      name: { title: 'Nom' },
      email: { title: 'Email' },
      phone: { title: 'Téléphone' }
    },
    noDataMessage: 'Aucune personne',
    pager: { display: false }
  };

  pageIndex = 0;
  pageSize = 5;
  total = 0;
  search = '';
  loading = false;
  personsCache: Person[] = [];

  constructor(private readonly personService: PersonService, private readonly dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadPersons();
  }

  loadPersons(): void {
    this.loading = true;
    this.personService
      .list({ page: this.pageIndex + 1, limit: this.pageSize, search: this.search })
      .subscribe((result) => {
        this.personsCache = result.data;
        this.total = result.total;
        this.source.load(result.data);
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
    if (event.action === 'delete' && confirm(`Supprimer ${person.name} ?`)) {
      this.personService.delete(person.id!).subscribe(() => this.loadPersons());
    }
  }

  applySearch(): void {
    this.pageIndex = 0;
    this.loadPersons();
  }
}
