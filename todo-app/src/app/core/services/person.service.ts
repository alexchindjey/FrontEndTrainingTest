import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { PaginatedResult } from '../models/paginated-result.model';
import { Person } from '../models/person.model';

export interface PersonQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class PersonService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/persons`;

  list(params: PersonQueryParams = {}): Observable<PaginatedResult<Person>> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('_page', params.page);
    if (params.limit) httpParams = httpParams.set('_limit', params.limit);
    if (params.search) httpParams = httpParams.set('name_like', params.search);

    return this.http
      .get<Person[]>(this.baseUrl, { params: httpParams, observe: 'response' })
      .pipe(
        map((response) => ({
          data: response.body ?? [],
          total: Number(response.headers.get('X-Total-Count') ?? response.body?.length ?? 0)
        }))
      );
  }

  getById(id: number): Observable<Person> {
    return this.http.get<Person>(`${this.baseUrl}/${id}`);
  }

  create(payload: Omit<Person, 'id'>): Observable<Person> {
    return this.http.post<Person>(this.baseUrl, payload);
  }

  update(payload: Person): Observable<Person> {
    if (!payload.id) {
      throw new Error('update() requires a person with an id');
    }
    return this.http.put<Person>(`${this.baseUrl}/${payload.id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
