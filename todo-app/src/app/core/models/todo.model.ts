import { Person } from './person.model';
import { TodoLabel } from './todo-label.enum';
import { TodoPriority } from './todo-priority.enum';

export interface Todo {
  id?: number;
  title: string;
  personId: number;
  person?: Person;
  startDate: string;
  endDate: string | null;
  completed: boolean;
  priority: TodoPriority;
  labels: TodoLabel[];
  description: string;
}
