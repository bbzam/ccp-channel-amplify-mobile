import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettagComponent } from './settag.component';

describe('SettagComponent', () => {
  let component: SettagComponent;
  let fixture: ComponentFixture<SettagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettagComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
