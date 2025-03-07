import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddKeyComponent } from './add-key.component';

describe('AddKeyComponent', () => {
  let component: AddKeyComponent;
  let fixture: ComponentFixture<AddKeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddKeyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
