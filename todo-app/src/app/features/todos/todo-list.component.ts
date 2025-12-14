import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

import { TodoService } from '../../core/services/todo.service';
import { PersonService } from '../../core/services/person.service';
import { Todo } from '../../core/models/todo.model';
import { TodoLabel, TODO_LABELS } from '../../core/models/todo-label.enum';
import { TodoPriority, TODO_PRIORITIES } from '../../core/models/todo-priority.enum';
import { Person } from '../../core/models/person.model';
import { TodoDialogComponent } from './todo-dialog.component';
import { SmartTableModule } from '../../shared/smart-table/smart-table.module';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SmartTableModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatPaginatorModule,
    MatChipsModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss'
})
export class TodoListComponent implements OnInit {
  source: Todo[] = [];
  settings = {
    actions: {
      custom: [
        { name: 'edit', icon: 'edit', color: 'primary' },
        { name: 'delete', icon: 'delete', color: 'warn' }
      ],
      position: 'right' as const
    },
    columns: {
      title: { title: 'Titre' },
      person: {
        title: 'Personne',
        valuePrepareFunction: (_: any, row: Todo) => row.person?.name ?? ''
      },
      priority: { title: 'Priorité' },
      startDate: { title: 'Début' },
      endDate: { title: 'Fin' },
      labels: {
        title: 'Labels',
        valuePrepareFunction: (labels: TodoLabel[]) => (labels || []).join(', ')
      },
      completed: {
        title: 'Terminé',
        valuePrepareFunction: (completed: boolean) => (completed ? 'Oui' : 'Non')
      }
    },
    noDataMessage: 'Aucune tâche'
  };

  pageIndex = 0;
  pageSize = 5;
  total = 0;
  filters: { priority?: TodoPriority; label?: TodoLabel } = {};
  loading = false;
  persons: Person[] = [];

  readonly priorities = TODO_PRIORITIES;
  readonly labels = TODO_LABELS;

  constructor(
    private readonly todoService: TodoService,
    private readonly personService: PersonService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPersons();
    this.loadTodos();
  }

  loadTodos(): void {
    this.loading = true;
    this.todoService
      .list({
        page: this.pageIndex + 1,
        limit: this.pageSize,
        priority: this.filters.priority,
        label: this.filters.label
      })
      .subscribe((result) => {
        this.total = result.total;
        this.source = result.data;
        this.loading = false;
      });
  }

  loadPersons(): void {
    this.personService.list({ page: 1, limit: 100 }).subscribe((res) => (this.persons = res.data));
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTodos();
  }

  onCustom(event: any): void {
    const todo: Todo = event.data;
    if (event.action === 'edit') {
      this.openDialog(todo);
    }
    if (event.action === 'delete' && confirm(`Supprimer "${todo.title}" ?`)) {
      this.todoService.delete(todo.id!).subscribe(() => this.loadTodos());
    }
  }

  openDialog(todo?: Todo): void {
    const dialogRef = this.dialog.open(TodoDialogComponent, {
      width: '720px',
      data: { todo, persons: this.persons }
    });

    dialogRef.afterClosed().subscribe((payload: Todo | undefined) => {
      if (!payload) return;
      if (payload.id) {
        this.todoService.update(payload).subscribe(() => this.loadTodos());
      } else {
        this.todoService.create(payload).subscribe(() => this.loadTodos());
      }
    });
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.loadTodos();
  }

  resetFilters(): void {
    this.filters = {};
    this.applyFilters();
  }
}
