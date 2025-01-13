import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CcpclassicComponent } from './ccpclassic.component';

describe('CcpclassicComponent', () => {
  let component: CcpclassicComponent;
  let fixture: ComponentFixture<CcpclassicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CcpclassicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CcpclassicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
