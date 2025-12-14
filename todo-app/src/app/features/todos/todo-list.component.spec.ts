import { of } from 'rxjs';
import { TodoListComponent } from './todo-list.component';
import { Todo } from '../../core/models/todo.model';
import { Person } from '../../core/models/person.model';
import { TodoLabel } from '../../core/models/todo-label.enum';

describe('TodoListComponent (logique)', () => {
  const persons: Person[] = [
    { id: '1' as any, name: 'Alice Martin', email: 'alice@example.com', phone: '1' },
    { id: '2' as any, name: 'Bruno Dupont', email: 'bruno@example.com', phone: '2' }
  ];

  const todos: Todo[] = [
    {
      id: '1' as any,
      title: 'Mettre en page la home',
      personId: '1' as any,
      startDate: '2024-01-01',
      endDate: null,
      completed: false,
      priority: 'Moyen' as any,
      labels: ['HTML', 'CSS'] as TodoLabel[],
      description: ''
    },
    {
      id: '2' as any,
      title: 'Brancher API Node',
      personId: '2' as any,
      startDate: '2024-01-02',
      endDate: null,
      completed: false,
      priority: 'Facile' as any,
      labels: ['NODE JS'] as TodoLabel[],
      description: ''
    }
  ];

  const todoServiceStub = {
    updated: undefined as Todo | undefined,
    list: jasmine.createSpy('list').and.returnValue(of({ data: todos, total: todos.length })),
    update: jasmine.createSpy('update').and.callFake((payload: Todo) => {
      todoServiceStub.updated = payload;
      return of(payload);
    })
  };

  const personServiceStub = { list: jasmine.createSpy('list').and.returnValue(of({ data: persons, total: persons.length })) };
  const dialogStub = { open: () => ({ afterClosed: () => of(undefined) }) };
  const translocoStub = { translate: () => '' };

  let component: TodoListComponent;

  beforeEach(() => {
    component = new TodoListComponent(
      todoServiceStub as any,
      personServiceStub as any,
      dialogStub as any,
      translocoStub as any
    );
    component.persons = persons;
    component.pageSize = 5;
    component.pageIndex = 0;
    todoServiceStub.list.calls.reset();
  });

  it('filtre sur labels (ET) et recherche titre/personne', () => {
    component.selectedLabels = ['HTML', 'CSS'] as TodoLabel[];
    component.searchTerm = 'alice';

    component.loadTodos();

    expect(component.total).toBe(1);
    expect(component.source[0].title).toContain('Mettre en page');
    expect(component.source[0].person?.name).toBe('Alice Martin');
  });

  it('marque une tâche terminée avec date du jour et ignore si déjà terminée', () => {
    const now = new Date('2024-05-05');
    jasmine.clock().install();
    jasmine.clock().mockDate(now);

    const todo = { ...todos[1] };
    component.toggleDone(todo);
    expect(todoServiceStub.update).toHaveBeenCalled();
    expect(todoServiceStub.updated?.completed).toBeTrue();
    expect(todoServiceStub.updated?.endDate).toBe('2024-05-05');

    todoServiceStub.update.calls.reset();
    component.toggleDone({ ...todo, completed: true });
    expect(todoServiceStub.update).not.toHaveBeenCalled();

    jasmine.clock().uninstall();
  });

  it('applique la pagination côté client après filtrage', () => {
    component.pageSize = 1;
    component.pageIndex = 0;
    component.selectedLabels = [];
    component.searchTerm = '';

    component.loadTodos();
    expect(component.total).toBe(2);
    expect(component.source.length).toBe(1);

    component.onPageChange({ pageIndex: 1, pageSize: 1, length: 2 } as any);
    expect(component.source.length).toBe(1);
  });
});
