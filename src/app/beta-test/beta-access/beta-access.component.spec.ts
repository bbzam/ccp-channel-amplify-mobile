import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetaAccessComponent } from './beta-access.component';

describe('BetaAccessComponent', () => {
  let component: BetaAccessComponent;
  let fixture: ComponentFixture<BetaAccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BetaAccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BetaAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
