import { Routes } from '@angular/router';
import { TodoListComponent } from './features/todos/todo-list.component';
import { PersonListComponent } from './features/persons/person-list.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'todos' },
  { path: 'todos', component: TodoListComponent },
  { path: 'persons', component: PersonListComponent },
  { path: '**', redirectTo: 'todos' }
];
