import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgFor, MatToolbarModule, MatButtonModule, MatCardModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Angular TODO List';
  nextSteps = [
    'Brancher json-server avec des mocks Todo et Person via HttpClient',
    'Construire les listes avec filtres, pagination et ng2-smart-table',
    'Créer la modale partagée avec validations et autocomplete'
  ];
}
