import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetFeaturedComponent } from './set-featured.component';

describe('SetFeaturedComponent', () => {
  let component: SetFeaturedComponent;
  let fixture: ComponentFixture<SetFeaturedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetFeaturedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetFeaturedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
