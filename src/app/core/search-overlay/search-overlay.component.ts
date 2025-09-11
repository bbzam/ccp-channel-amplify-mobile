import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FeaturesService } from '../../features/features.service';
import { debounceTime, Subject } from 'rxjs';

export interface SearchResult {
  [key: string]: any;
}

@Component({
  selector: 'app-search-overlay',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './search-overlay.component.html',
  styleUrl: './search-overlay.component.css',
})
export class SearchOverlayComponent implements AfterViewInit {
  @Input() isOpen = false;
  @Output() closeSearchEvent = new EventEmitter<void>();
  @Output() searchResultSelected = new EventEmitter<SearchResult>();

  @ViewChild('searchInput') searchInput!: ElementRef;

  private readonly featuresService = inject(FeaturesService);
  private searchSubject = new Subject<string>();

  searchQuery = '';
  searchResults: SearchResult[] = [];

  constructor() {
    this.searchSubject.pipe(debounceTime(300)).subscribe((query) => {
      this.performSearch(query);
    });
  }

  ngAfterViewInit() {
    if (this.isOpen && this.searchInput) {
      setTimeout(() => this.searchInput.nativeElement.focus(), 100);
    }
  }

  onSearchInput() {
    if (this.searchQuery.trim()) {
      this.searchSubject.next(this.searchQuery);
    } else {
      this.searchResults = [];
    }
  }

  private async performSearch(query: string) {
    try {
      const content = await this.featuresService.getAllContents(
        '',
        true,
        undefined,
        query
      );

      const processedResults = await Promise.all(
        (content || []).map(async (item: any) => {
          const portraitImagePresignedUrl =
            await this.featuresService.getFileUrl(item.portraitImageUrl);

          return {
            ...item, // Return all original fields
            portraitImagePresignedUrl,
            category: this.formatCategory(item.category),
          };
        })
      );

      this.searchResults = processedResults;
    } catch (error) {
      console.error('Search error:', error);
      this.searchResults = [];
    }
  }

  transform(value: number): string {
    if (isNaN(value) || value < 0) return '00:00:00';

    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = Math.round(value % 60);

    let timeParts: string[] = [];

    if (hours > 0) {
      timeParts.push(`${hours}h`);
    }
    if (minutes > 0) {
      timeParts.push(`${minutes}m`);
    }
    if (seconds > 0 || timeParts.length === 0) {
      timeParts.push(`${seconds}s`);
    }

    return timeParts.join(' ');
  }

  private formatCategory(category: string): string {
    const categoryMap: { [key: string]: string } = {
      ccpclassics: 'CCP Classic',
      ccpspecials: 'CCP Special',
      theater: 'Theater',
      film: 'Film',
      music: 'Music',
      dance: 'Dance',
      education: 'Education',
    };
    return categoryMap[category] || category;
  }

  selectResult(result: SearchResult) {
    this.searchResultSelected.emit(result);
    this.closeSearch();
  }

  closeSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.closeSearchEvent.emit();
  }
}
