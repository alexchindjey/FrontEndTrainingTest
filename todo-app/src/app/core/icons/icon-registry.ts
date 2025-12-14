import { APP_INITIALIZER } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

const ICONS: Record<string, string> = {
  add: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"/></svg>',
  refresh:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-8 3.58-8 8h2.05c0-3.27 2.68-5.95 5.95-5.95 1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35zM6.35 17.65C7.8 19.1 9.79 20 12 20c4.42 0 8-3.58 8-8h-2.05c0 3.27-2.68 5.95-5.95 5.95-1.66 0-3.14-.69-4.22-1.78L11 13H4v7l2.35-2.35z"/></svg>',
  checklist_rtl:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 5h11v2H3V5zm0 6h11v2H3v-2zm0 6h11v2H3v-2zm13-9.5 1.5-1.5L21 8l-1.5 1.5L16 8zm0 6 1.5-1.5L21 14l-1.5 1.5L16 14z"/></svg>',
  group:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5s-3 1.34-3 3 1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5C23 14.17 18.33 13 16 13z"/></svg>',
  view_list:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 14h4v-4H4v4zm0 6h4v-4H4v4zm0-12h4V4H4v4zm6 0h10V4H10v4zm0 6h10v-4H10v4zm0 6h10v-4H10v4z"/></svg>',
  format_list_bulleted:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5S3.17 13.5 4 13.5 5.5 12.83 5.5 12 4.83 10.5 4 10.5zm0-6C3.17 4.5 2.5 5.17 2.5 6S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zM4 16.5c-.83 0-1.5.67-1.5 1.5S3.17 19.5 4 19.5 5.5 18.83 5.5 18 4.83 16.5 4 16.5zM7 19h14v-2H7v2zm0-14v2h14V5H7zm0 6h14V9H7v2z"/></svg>',
  schedule:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 8v5l4.25 2.52.75-1.23-3.5-2.08V8z"/><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"/></svg>',
  task_alt:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 12c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2s10 4.48 10 10zm-6.59-4.83L11 12.58l-2.41-2.4-1.42 1.41L11 15.4l6.41-6.42-1.42-1.41z"/></svg>',
  sell:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.41 11.58 12.42 2.59c-.37-.37-.88-.59-1.41-.59H4c-1.1 0-2 .9-2 2v7c0 .53.21 1.04.59 1.41l8.99 8.99c.78.78 2.05.78 2.83 0l7-7c.79-.78.79-2.05 0-2.83zM5.5 8C4.67 8 4 7.33 4 6.5S4.67 5 5.5 5 7 5.67 7 6.5 6.33 8 5.5 8z"/></svg>',
  search:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
  edit:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/></svg>',
  delete:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
  check_circle:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14-4-4 1.41-1.41L10 13.17l6.59-6.59L18 8l-8 8z"/></svg>',
  radio_button_unchecked:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>',
  close:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
  light_mode:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5h-1v3h1V2zm0 21h-1v3h1v-3zm9-10h-3v1h3v-1zM6 12H3v1h3v-1zm9.24-5.76 1.8-1.8 1.42 1.42-1.8 1.8-1.42-1.42zM4.54 17.66l1.42-1.42 1.8 1.8-1.42 1.42-1.8-1.8zM17.66 19.46l-1.42-1.42 1.8-1.8 1.42 1.42-1.8 1.8zM4.54 6.34l1.8-1.8 1.42 1.42-1.8 1.8-1.42-1.42z"/></svg>',
  dark_mode:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9.37 5.51A7.5 7.5 0 1 0 19.5 15.5 8.5 8.5 0 0 1 9.37 5.51z"/></svg>'
};

function registerIcons(registry: MatIconRegistry, sanitizer: DomSanitizer) {
  return () => {
    Object.entries(ICONS).forEach(([name, svg]) =>
      registry.addSvgIconLiteral(name, sanitizer.bypassSecurityTrustHtml(svg))
    );
  };
}

export const ICON_PROVIDERS = [
  {
    provide: APP_INITIALIZER,
    useFactory: registerIcons,
    deps: [MatIconRegistry, DomSanitizer],
    multi: true
  }
];
