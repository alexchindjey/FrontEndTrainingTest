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
  pageIndex = 0;
  pageSize = 5;
  total = 0;
  filters: { priority?: TodoPriority; label?: TodoLabel; completed?: boolean } = {};
  loading = false;
  persons: Person[] = [];
  searchTerm = '';

  readonly priorities = TODO_PRIORITIES;
  readonly labels = TODO_LABELS;
  readonly labelColors: Record<string, string> = {
    HTML: '#ef4444',
    CSS: '#3b82f6',
    'NODE JS': '#0ea5e9',
    JQUERY: '#10b981'
  };

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
        completed: this.filters.completed,
        search: this.searchTerm
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

  avatarInitials(todo: Todo): string {
    const name = todo.person?.name ?? '';
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  labelColor(label: TodoLabel): string {
    return this.labelColors[label] ?? '#cbd5e1';
  }

  scheduleText(todo: Todo): string {
    const date = todo.endDate || todo.startDate;
    return date ? `Schedule for ${date}` : '';
  }

  toggleDone(todo: Todo): void {
    if (todo.completed) return;
    const endDate = new Date().toISOString().slice(0, 10);
    const payload: Todo = { ...todo, completed: true, endDate };
    this.todoService.update(payload).subscribe(() => this.loadTodos());
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
