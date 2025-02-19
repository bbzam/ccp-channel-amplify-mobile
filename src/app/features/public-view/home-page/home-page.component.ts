import { Component, inject, OnInit } from '@angular/core';
import { featuredImages, topFeatured } from '../mock-data';
import { MatButtonModule } from '@angular/material/button';
import { BannerComponent } from '../public-banner/banner.component';
import { allFeatured } from '../../../shared/mock-data';
import { MatDialog } from '@angular/material/dialog';
import { BetaAccessComponent } from '../../../beta-test/beta-access/beta-access.component';
import { SignupComponent } from '../../../auth/components/signup/signup.component';

@Component({
  selector: 'app-home-page',
  imports: [MatButtonModule, BannerComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  banners: any[] = topFeatured;
  images = featuredImages;
  allFeatured = allFeatured;

  ngOnInit(): void {}

  register(): void {
    // this.dialog.open(SignupComponent).afterClosed().subscribe();
    this.dialog
      .open(BetaAccessComponent)
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.dialog.open(SignupComponent, {disableClose: true}).afterClosed();
        }
      });
  }
}
