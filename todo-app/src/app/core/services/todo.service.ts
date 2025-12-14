import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { PaginatedResult } from '../models/paginated-result.model';
import { Todo } from '../models/todo.model';
import { TodoLabel } from '../models/todo-label.enum';
import { TodoPriority } from '../models/todo-priority.enum';

export interface TodoQueryParams {
  page?: number;
  limit?: number;
  priority?: TodoPriority;
  label?: TodoLabel;
  completed?: boolean;
  search?: string;
  labels?: TodoLabel[];
}

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/todos`;

  list(params: TodoQueryParams = {}): Observable<PaginatedResult<Todo>> {
    let httpParams = new HttpParams().set('_expand', 'person');
    if (params.page) httpParams = httpParams.set('_page', params.page);
    if (params.limit) httpParams = httpParams.set('_limit', params.limit);
    if (params.priority) httpParams = httpParams.set('priority', params.priority);
    if (params.label) httpParams = httpParams.set('labels_like', params.label);
    if (params.labels && params.labels.length > 0) {
      params.labels.forEach((l) => {
        httpParams = httpParams.append('labels_like', l);
      });
    }
    if (params.completed !== undefined) httpParams = httpParams.set('completed', params.completed);
    if (params.search) httpParams = httpParams.set('title_like', params.search);

    return this.http
      .get<Todo[]>(this.baseUrl, { params: httpParams, observe: 'response' })
      .pipe(
        map((response) => ({
          data: response.body ?? [],
          total: Number(response.headers.get('X-Total-Count') ?? response.body?.length ?? 0)
        }))
      );
  }

  getById(id: number): Observable<Todo> {
    return this.http.get<Todo>(`${this.baseUrl}/${id}`, {
      params: new HttpParams().set('_expand', 'person')
    });
  }

  create(payload: Omit<Todo, 'id' | 'person'>): Observable<Todo> {
    return this.http.post<Todo>(this.baseUrl, payload);
  }

  update(payload: Todo): Observable<Todo> {
    if (!payload.id) {
      throw new Error('update() requires a todo with an id');
    }
    return this.http.put<Todo>(`${this.baseUrl}/${payload.id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
