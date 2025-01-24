import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { dashboardDetails } from './mock-data';

@Component({
  selector: 'app-dashboard-template',
  imports: [MatGridListModule, MatCardModule],
  templateUrl: './dashboard-template.component.html',
  styleUrl: './dashboard-template.component.css',
})
export class DashboardTemplateComponent {
  readonly data:any[] = dashboardDetails
}
