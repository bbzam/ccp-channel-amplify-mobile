import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItAdminComponent } from './it-admin.component';

describe('ItAdminComponent', () => {
  let component: ItAdminComponent;
  let fixture: ComponentFixture<ItAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
