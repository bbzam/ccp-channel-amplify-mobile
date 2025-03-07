import { Component, inject } from '@angular/core';
import { FeaturesService } from '../../features/features.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgFor } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-key',
  imports: [
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    MatDividerModule,
  ],
  templateUrl: './add-key.component.html',
  styleUrl: './add-key.component.css',
})
export class AddKeyComponent {
  private readonly fb = inject(FormBuilder);
  private readonly featuresService = inject(FeaturesService);
  private readonly dialogRef = inject(MatDialogRef);
  keyUploadForm: FormGroup;
  keys: { code: string }[] = [];
  newKey: string = '';
  isLoading: boolean = false;

  constructor() {
    this.keyUploadForm = this.fb.group({});
  }

  cancelOnClick() {
    this.dialogRef.close();
  }

  addKey() {
    if (this.newKey.trim()) {
      this.keys.push({ code: this.newKey.trim() });
      this.newKey = '';
    }
  }

  removeKey(index: number) {
    this.keys.splice(index, 1);
  }

  async uploadKeys() {
    if (this.keys.length > 0) {
      try {
        this.isLoading = true;
        await this.featuresService.uploadKeys(this.keys).then((data) => {
          if (data) {
            this.dialogRef.close(true);
          } else {
            this.dialogRef.close(false);
          }
        });
        this.keys = [];
      } catch (error) {
        console.error('Error uploading keys:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }
}
