import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProblemInfoComponent } from './problem-info.component';

describe('ProblemInfoComponent', () => {
  let component: ProblemInfoComponent;
  let fixture: ComponentFixture<ProblemInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProblemInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProblemInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
