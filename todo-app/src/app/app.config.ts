import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideTransloco } from '@ngneat/transloco';
import { MatIconRegistry } from '@angular/material/icon';

import { routes } from './app.routes';
import { TranslocoHttpLoader } from './transloco.loader';
import { translocoOptions } from './transloco.config';
import { ICON_PROVIDERS } from './core/icons/icon-registry';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    provideTransloco({
      config: translocoOptions,
      loader: TranslocoHttpLoader
    }),
    MatIconRegistry,
    ...ICON_PROVIDERS
  ]
};
