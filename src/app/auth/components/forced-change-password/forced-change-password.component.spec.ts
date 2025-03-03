import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForcedChangePasswordComponent } from './forced-change-password.component';

describe('ForcedChangePasswordComponent', () => {
  let component: ForcedChangePasswordComponent;
  let fixture: ComponentFixture<ForcedChangePasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForcedChangePasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForcedChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
