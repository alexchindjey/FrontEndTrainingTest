import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideTransloco, TranslocoLoader, translocoConfig } from '@ngneat/transloco';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

class InlineLoader implements TranslocoLoader {
  getTranslation() {
    return of({ app: { title: 'Angular TODO List', nav: { tasks: 'Tâches', persons: 'Personnes' } } });
  }
}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, AppComponent],
      providers: [
        ...provideTransloco({
          config: translocoConfig({
            availableLangs: ['fr'],
            defaultLang: 'fr',
            reRenderOnLangChange: true,
            prodMode: false
          }),
          loader: InlineLoader
        })
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the correct title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Angular TODO List');
  });
});
