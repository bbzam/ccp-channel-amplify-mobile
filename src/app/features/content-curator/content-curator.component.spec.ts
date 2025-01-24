import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentCuratorComponent } from './content-curator.component';

describe('ContentCuratorComponent', () => {
  let component: ContentCuratorComponent;
  let fixture: ComponentFixture<ContentCuratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentCuratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentCuratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
