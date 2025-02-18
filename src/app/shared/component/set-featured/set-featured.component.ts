import { Component, Input, OnInit } from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { allFeatured, theaters } from '../../mock-data';
import { MatIconModule } from '@angular/material/icon';

interface ContentItem {
  title: string;
  category: string;
  subcategory: string;
  description: string;
  fullVideoUrl: string;
  portraitImageUrl: string;
  landscapeImageUrl: string;
  previewVideoUrl: string;
  resolution: string;
  runtime: string;
}

@Component({
  selector: 'app-set-featured',
  imports: [CdkDropListGroup, CdkDropList, CdkDrag, MatIconModule],
  templateUrl: './set-featured.component.html',
  styleUrl: './set-featured.component.css',
})
export class SetFeaturedComponent implements OnInit {
  @Input() contents!: ContentItem[];
  @Input() featured!: ContentItem[];

  ngOnInit() {
    this.updateAvailableItems();
  }

  updateAvailableItems() {
    // Filter out items that are already in the featured list
    this.contents = allFeatured.filter(
      (item) =>
        !this.featured.some(
          (featuredItem) =>
            featuredItem.title === item.title
        )
    );
  }

  drop(event: CdkDragDrop<ContentItem[], ContentItem[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      // Update the available items list after transfer
      this.updateAvailableItems();
    }
  }
}
