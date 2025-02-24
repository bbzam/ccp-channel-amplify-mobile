import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';

export interface TabConfig {
  label: string;
  category: string;
}

@Component({
  selector: 'app-tab',
  imports: [MatTabsModule],
  templateUrl: './tab.component.html',
  styleUrl: './tab.component.css',
})
export class TabComponent {
  @Input() tabs: any[] = [];
  @Input() contentTemplate!: TemplateRef<any>;
  @Output() tabChanged = new EventEmitter<string>();

  onTabChange(event: MatTabChangeEvent): void {
    const selectedTab = this.tabs[event.index];
    this.tabChanged.emit(selectedTab.category);
  }
}
