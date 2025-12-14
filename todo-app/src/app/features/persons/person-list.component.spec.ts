import { of } from 'rxjs';
import { PersonListComponent } from './person-list.component';
import { Person } from '../../core/models/person.model';

describe('PersonListComponent (logique)', () => {
  const persons: Person[] = [
    { id: '1' as any, name: 'Alice Martin', email: 'alice@example.com', phone: '1' },
    { id: '2' as any, name: 'Bruno Dupont', email: 'bruno@example.com', phone: '2' },
    { id: '3' as any, name: 'Carla Rossi', email: 'carla@test.com', phone: '3' }
  ];

  const personServiceStub = {
    list: jasmine.createSpy('list').and.returnValue(of({ data: persons, total: persons.length }))
  };
  const dialogStub = { open: () => ({ afterClosed: () => of(undefined) }) };
  const translocoStub = { translate: () => '' };

  let component: PersonListComponent;

  beforeEach(() => {
    component = new PersonListComponent(personServiceStub as any, dialogStub as any, translocoStub as any);
    component.pageSize = 1;
    component.pageIndex = 0;
  });

  it('filtre par nom ou email et calcule le total', () => {
    component.search = 'alice';
    component.searchEmail = 'example.com';
    component.ngOnInit();

    expect(component.total).toBe(1); // Alice seulement avec le terme "alice"
    expect(component.source.length).toBe(1); // pageSize=1
  });

  it('réduit la page si hors bornes après filtrage', () => {
    component.pageIndex = 5; // au-delà
    component.search = 'carla';
    component.searchEmail = '';

    component.loadPersons();

    expect(component.total).toBe(1);
    expect(component.pageIndex).toBe(0);
    expect(component.source[0].name).toBe('Carla Rossi');
  });
});
