import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, startWith } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { Header2Component } from '../../core/header2/header2.component';
import { Sidenav2Component } from '../../core/sidenav2/sidenav2.component';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-admin',
  imports: [
    Header2Component,
    Sidenav2Component,
    RouterOutlet,
    MatSidenavModule,
    AsyncPipe,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent {
  private breakpointObserver = inject(BreakpointObserver);

  isTabletOrBelow$ = this.breakpointObserver
    .observe([Breakpoints.Tablet, Breakpoints.Handset])
    .pipe(
      map((result) => result.matches),
      startWith(false)
    );

  hasBackdrop$ = this.isTabletOrBelow$;
  mode$ = this.isTabletOrBelow$.pipe(
    map((isTablet) => (isTablet ? 'over' : 'side'))
  );
  opened$ = this.isTabletOrBelow$.pipe(map((isTablet) => !isTablet));
}
