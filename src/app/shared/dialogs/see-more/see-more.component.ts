import { Component, inject, Inject, Input } from '@angular/core';
import { ListGridComponent } from '../../component/list-grid/list-grid.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-see-more',
  imports: [ListGridComponent, MatIcon, MatButtonModule, MatTooltipModule],
  templateUrl: './see-more.component.html',
  styleUrl: './see-more.component.css',
})
export class SeeMoreComponent {
  @Input() contentData: any;
  @Input() title: string;
  readonly dialogRef = inject(MatDialogRef<SeeMoreComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.contentData = data.data;
    this.title = data.title;
  }

  close() {
    this.dialogRef.close();
  }
}
