import {
  Component,
  ElementRef,
  inject,
  OnInit,
  Renderer2,
} from '@angular/core';
import { MainLayoutComponent } from './core/main-layout/main-layout.component';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import {
  AmplifyAuthenticatorModule,
  AuthenticatorService,
} from '@aws-amplify/ui-angular';

@Component({
  selector: 'app-root',
  imports: [MainLayoutComponent, AmplifyAuthenticatorModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'CCP Channel';
  readonly authenticator = inject(AuthenticatorService);
  readonly renderer = inject(Renderer2);
  readonly elementRef = inject(ElementRef);

  ngOnInit(): void {
    const activeElement = document.activeElement as HTMLElement;
    const hiddenContainer = this.elementRef.nativeElement.querySelector(
      '[aria-hidden="true"]'
    );
    if (hiddenContainer?.contains(activeElement)) {
      activeElement.blur();
    }
  }

  constructor() {
    Amplify.configure(outputs);
  }
}
