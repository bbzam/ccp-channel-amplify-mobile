import { Component } from '@angular/core';
import { SetFeaturedComponent } from '../../../shared/component/set-featured/set-featured.component';
import { allFeatured, theaters } from '../../../shared/mock-data';

@Component({
  selector: 'app-setfeatured',
  imports: [SetFeaturedComponent],
  templateUrl: './setfeatured.component.html',
  styleUrl: './setfeatured.component.css',
})
export class SetfeaturedComponent {
  contents: any[] = allFeatured;
  featured: any[] = theaters;
}
