import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SharedService } from '../../shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loader',
  imports: [],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css',
})
export class LoaderComponent implements OnInit, OnDestroy {
  isLoading = false;
  message?: string;
  private subscription: Subscription;
  readonly sharedService = inject(SharedService);

  constructor() {
    this.subscription = this.sharedService.isLoading$.subscribe((state) => {
      this.isLoading = state.show;
      this.message = state.message;
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
