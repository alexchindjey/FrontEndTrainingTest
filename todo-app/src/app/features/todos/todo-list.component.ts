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
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    MatProgressSpinnerModule,
    TranslocoModule
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
      title: { title: 'tasks.columns.title' },
      person: {
        title: 'tasks.columns.person',
        valuePrepareFunction: (_: any, row: Todo) => row.person?.name ?? ''
      },
      priority: { title: 'tasks.columns.priority' },
      startDate: { title: 'tasks.columns.startDate' },
      endDate: { title: 'tasks.columns.endDate' },
      labels: {
        title: 'tasks.columns.labels',
        valuePrepareFunction: (labels: TodoLabel[]) => (labels || []).join(', ')
      },
      completed: {
        title: 'tasks.columns.completed',
        valuePrepareFunction: (completed: boolean) =>
          completed ? this.transloco.translate('common.yes') : this.transloco.translate('common.no')
      }
    },
    noDataMessage: 'tasks.noData'
  };

  pageIndex = 0;
  pageSize = 5;
  total = 0;
  filters: { priority?: TodoPriority; label?: TodoLabel; completed?: boolean } = {};
  loading = false;
  persons: Person[] = [];
  searchTerm = '';

  readonly priorities = TODO_PRIORITIES;
  readonly labels = TODO_LABELS;

  constructor(
    private readonly todoService: TodoService,
    private readonly personService: PersonService,
    private readonly dialog: MatDialog,
    private readonly transloco: TranslocoService
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
        label: this.filters.label,
        completed: this.filters.completed
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
    if (
      event.action === 'delete' &&
      confirm(this.transloco.translate('tasks.confirmDelete', { title: todo.title }))
    ) {
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

  toggleCompleted(value: boolean | undefined): void {
    this.filters.completed = value;
    this.applyFilters();
  }

  exportExcel(): void {
    const yes = this.transloco.translate('common.yes');
    const no = this.transloco.translate('common.no');
    const rows = this.source.map((todo) => ({
      [this.transloco.translate('tasks.columns.title')]: todo.title,
      [this.transloco.translate('tasks.columns.person')]: todo.person?.name ?? '',
      [this.transloco.translate('tasks.columns.priority')]: todo.priority,
      [this.transloco.translate('tasks.columns.startDate')]: todo.startDate,
      [this.transloco.translate('tasks.columns.endDate')]: todo.endDate ?? '',
      [this.transloco.translate('tasks.columns.labels')]: (todo.labels || []).join(', '),
      [this.transloco.translate('tasks.columns.completed')]: todo.completed ? yes : no
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, 'Todos');
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'todos.xlsx');
  }

  exportPdf(): void {
    const yes = this.transloco.translate('common.yes');
    const no = this.transloco.translate('common.no');
    const doc = new jsPDF();
    const head = [
      [
        this.transloco.translate('tasks.columns.title'),
        this.transloco.translate('tasks.columns.person'),
        this.transloco.translate('tasks.columns.priority'),
        this.transloco.translate('tasks.columns.startDate'),
        this.transloco.translate('tasks.columns.endDate'),
        this.transloco.translate('tasks.columns.labels'),
        this.transloco.translate('tasks.columns.completed')
      ]
    ];
    const body = this.source.map((todo) => [
      todo.title,
      todo.person?.name ?? '',
      todo.priority,
      todo.startDate,
      todo.endDate ?? '',
      (todo.labels || []).join(', '),
      todo.completed ? yes : no
    ]);
    autoTable(doc, { head, body });
    doc.save('todos.pdf');
  }
}
