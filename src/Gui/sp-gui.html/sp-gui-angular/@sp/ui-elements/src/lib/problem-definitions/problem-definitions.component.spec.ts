import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProblemDefinitionsComponent } from './problem-definitions.component';

describe('ProblemDefinitionsComponent', () => {
  let component: ProblemDefinitionsComponent;
  let fixture: ComponentFixture<ProblemDefinitionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProblemDefinitionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProblemDefinitionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
