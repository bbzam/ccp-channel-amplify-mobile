import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureLandingPageComponent } from './configure-landing-page.component';

describe('ConfigureLandingPageComponent', () => {
  let component: ConfigureLandingPageComponent;
  let fixture: ComponentFixture<ConfigureLandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigureLandingPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigureLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
