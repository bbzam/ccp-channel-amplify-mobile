import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessMessageDialogComponent } from './success-message-dialog.component';

describe('SuccessMessageDialogComponent', () => {
  let component: SuccessMessageDialogComponent;
  let fixture: ComponentFixture<SuccessMessageDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessMessageDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuccessMessageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
