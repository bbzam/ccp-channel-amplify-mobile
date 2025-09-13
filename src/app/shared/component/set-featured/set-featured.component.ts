import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { SharedService } from '../../shared.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';

interface ContentItem {
  id: string;
  title: string;
  // category: string;
  // subcategory: string;
  // description: string;
  // fullVideoUrl: string;
  // portraitImageUrl: string;
  // landscapeImageUrl: string;
  // previewVideoUrl: string;
  // resolution: string;
  // runtime: string;
}

@Component({
  selector: 'app-set-featured',
  imports: [
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatInputModule,
  ],
  templateUrl: './set-featured.component.html',
  styleUrl: './set-featured.component.css',
})
export class SetFeaturedComponent implements OnInit, OnChanges {
  readonly sharedService = inject(SharedService);
  @Input() hasChanges: boolean = false;
  @Input() contents!: ContentItem[];
  @Input() featured!: ContentItem[];
  @Input() optionName!: string;
  @Input() selectedName!: string;
  @Output() saveFeaturedContent = new EventEmitter<void>();
  @Output() getFeaturedContent = new EventEmitter<string>();
  @Output() itemsChanged = new EventEmitter<{
    options: ContentItem[];
    contents: ContentItem[];
  }>();
  featuredIds: string[] = [];
  private searchTimeout: any;

  // updateAvailableItems() {
  //   // Filter out items that are already in the featured list
  //   this.contents = this.contents.filter(
  //     (item) =>
  //       !this.featured.some((featuredItem) => featuredItem.id === item.id)
  //   );
  // }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['featured']) {
      this.featuredIds = this.featured?.map((item) => item.id) || [];
    }
  }

  ngOnInit() {
    // Initialize featuredIds with current featured items
    this.featuredIds = this.featured?.map((item) => item.id) || [];
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

      this.featuredIds = this.featured.map((item) => item.id);
      this.hasChanges = true;
    }

    // Emit the updated arrays
    this.itemsChanged.emit({
      options: this.featured,
      contents: this.contents,
    });
  }

  // applyFilter(event: Event) {
  //   const target = event.target as HTMLInputElement;
  //   const value = target.value;
  //   this.getFeaturedContent.emit(value);
  // }

  applyFilter(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    // Clear any existing timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Set new timeout
    this.searchTimeout = setTimeout(() => {
      this.getFeaturedContent.emit(value);
    }, 500); // .5 second delay
  }

  save() {
    this.saveFeaturedContent.emit();
  }
}
