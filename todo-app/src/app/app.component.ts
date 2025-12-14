import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    FormsModule,
    TranslocoModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSelectModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Angular TODO List';

  langs = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' }
  ];
  activeLang = 'fr';

  constructor(private readonly translocoService: TranslocoService) {
    this.activeLang = this.translocoService.getActiveLang() ?? 'fr';
  }

  changeLang(lang: string): void {
    this.activeLang = lang;
    this.translocoService.setActiveLang(lang);
  }
}
