import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CcpspecialComponent } from './ccpspecial.component';

describe('CcpspecialComponent', () => {
  let component: CcpspecialComponent;
  let fixture: ComponentFixture<CcpspecialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CcpspecialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CcpspecialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
