import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoVideoAvailableComponent } from './no-video-available.component';

describe('NoVideoAvailableComponent', () => {
  let component: NoVideoAvailableComponent;
  let fixture: ComponentFixture<NoVideoAvailableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoVideoAvailableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoVideoAvailableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
