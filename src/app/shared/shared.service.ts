import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface LoaderState {
  show: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private isLoadingSubject = new BehaviorSubject<LoaderState>({ show: false });
  isLoading$: Observable<LoaderState> = this.isLoadingSubject.asObservable();

  showLoader(message?: string): void {
    this.isLoadingSubject.next({ show: true, message });
  }

  hideLoader(): void {
    this.isLoadingSubject.next({ show: false });
  }
}
