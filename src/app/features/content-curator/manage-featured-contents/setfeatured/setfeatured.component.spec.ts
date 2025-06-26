import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetfeaturedComponent } from './setfeatured.component';

describe('SetfeaturedComponent', () => {
  let component: SetfeaturedComponent;
  let fixture: ComponentFixture<SetfeaturedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetfeaturedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetfeaturedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
