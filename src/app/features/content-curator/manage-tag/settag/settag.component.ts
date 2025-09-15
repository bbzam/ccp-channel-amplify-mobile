import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetFeaturedComponent } from '../../../../shared/component/set-featured/set-featured.component';
import { FeaturesService } from '../../../features.service';
import { SharedService } from '../../../../shared/shared.service';

interface ContentItem {
  id: string;
  title: string;
}

interface TagItem {
  id?: string;
  tag?: string;
  selectedContent?: string;
}

@Component({
  selector: 'app-settag',
  imports: [CommonModule, SetFeaturedComponent],
  templateUrl: './settag.component.html',
  styleUrl: './settag.component.css',
  standalone: true,
})
export class SettagComponent implements OnInit {
  readonly featuresService = inject(FeaturesService);
  readonly sharedService = inject(SharedService);
  optionName: string = 'List of Contents';
  selectedName: string = 'Selected Content/s';
  hasChanges: boolean = false;
  contents: ContentItem[] = [];
  tag: ContentItem[] = [];
  tagData: TagItem[] = [];
  currentTag: string = '';

  async ngOnInit(): Promise<void> {
    await this.loadTags();
  }

  private async loadTags(): Promise<void> {
    try {
      this.tagData = await this.sharedService.getAllTags();
    } catch (error) {
      this.tagData = [];
    }
  }

  async onTagChanged(tagId: string): Promise<void> {
    this.hasChanges = false;
    this.currentTag = tagId;
    this.tag = [];

    await this.getAllContents();
    await this.getAllTags(tagId);

    // Filter out already selected items from contents
    this.contents = this.contents.filter(
      (content) => !this.tag.some((selected) => selected.id === content.id)
    );
  }

  async getAllContents(keyword?: string): Promise<void> {
    const fields = ['id', 'title'];
    try {
      const data = await this.featuresService.getAllContents(
        '',
        true,
        fields,
        keyword
      );
      if (data) {
        this.contents = data.filter(
          (content: any) =>
            !this.tag.some((selected) => selected.id === content.id)
        );
      }
    } catch (error) {
      this.contents = [];
    }
  }

  async getAllTags(currentTagId: string) {
    if (!currentTagId) return;

    try {
      const matchingTag = this.tagData.find((tag) => tag.id === currentTagId);

      if (matchingTag?.selectedContent) {
        const selectedIds = matchingTag.selectedContent.split(',');
        this.tag = selectedIds
          .map((id) => {
            const matchingContent = this.contents.find(
              (content) => content.id === id
            );
            return matchingContent;
          })
          .filter((item): item is ContentItem => !!item); // Type guard to ensure non-null
      } else {
        this.tag = [];
      }
    } catch (error) {
      this.tag = [];
    }
  }

  onItemsChanged(event: { options: ContentItem[]; contents: ContentItem[] }) {
    this.tag = event.options;
    this.contents = event.contents.filter(
      (content) => !event.options.some((selected) => selected.id === content.id)
    );
    this.hasChanges = true;
  }

  async saveTagContent() {
    if (!this.currentTag) return;

    const data: TagItem = {
      id: this.currentTag,
      selectedContent: this.tag.map((item) => item.id).join(','),
    };

    try {
      await this.sharedService.updateTag(data);
      this.hasChanges = false;
    } catch (error) {}
  }
}
