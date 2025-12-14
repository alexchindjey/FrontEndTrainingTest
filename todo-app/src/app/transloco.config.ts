import { translocoConfig } from '@ngneat/transloco';

export const translocoOptions = translocoConfig({
  availableLangs: ['fr', 'en'],
  defaultLang: 'fr',
  reRenderOnLangChange: true,
  prodMode: false
});
