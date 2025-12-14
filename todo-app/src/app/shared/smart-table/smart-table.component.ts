import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@ngneat/transloco';

type ColumnType = 'text' | 'avatar';

interface SmartTableColumn {
  title?: string;
  valuePrepareFunction?: (value: any, row: any) => any;
  type?: ColumnType;
  field?: string;
}

interface SmartTableSettings {
  columns: Record<string, SmartTableColumn>;
  actions?: {
    custom?: { name: string; title?: string; icon?: string; color?: string }[];
    position?: 'left' | 'right';
  };
  noDataMessage?: string;
}

@Component({
  selector: 'ng2-smart-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule, MatTooltipModule, TranslocoModule],
  templateUrl: './smart-table.component.html',
  styleUrl: './smart-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmartTableComponent implements OnChanges {
  @Input() settings: SmartTableSettings = { columns: {} };
  @Input() source: any[] = [];

  @Output() custom = new EventEmitter<{ action: string; data: any }>();

  displayedColumns: string[] = [];
  columnsEntries: { key: string; config: SmartTableColumn }[] = [];

  ngOnChanges(): void {
    const columns = this.settings?.columns ?? {};
    this.columnsEntries = Object.entries(columns).map(([key, config]) => ({ key, config }));
    const hasActions = (this.settings?.actions?.custom?.length ?? 0) > 0;
    this.displayedColumns = [
      ...(this.settings?.actions?.position === 'left' && hasActions ? ['__actions'] : []),
      ...this.columnsEntries.map((c) => c.key),
      ...(this.settings?.actions?.position !== 'left' && hasActions ? ['__actions'] : [])
    ];
  }

  renderCell(col: SmartTableColumn, value: any, row: any): any {
    if (col.type === 'avatar') {
      const name = col.field ? row[col.field] : (value ?? '');
      return this.initials(name);
    }
    return col.valuePrepareFunction ? col.valuePrepareFunction(value, row) : value;
  }

  onAction(action: string, row: any): void {
    this.custom.emit({ action, data: row });
  }

  private initials(name: string): string {
    if (!name) return '';
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
}
