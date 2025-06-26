import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCustomFieldComponent } from './view-custom-field.component';

describe('ViewCustomFieldComponent', () => {
  let component: ViewCustomFieldComponent;
  let fixture: ComponentFixture<ViewCustomFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCustomFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewCustomFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
