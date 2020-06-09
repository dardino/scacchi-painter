import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpSolutionDescComponent } from './sp-solution-desc.component';

describe('SpSolutionDescComponent', () => {
  let component: SpSolutionDescComponent;
  let fixture: ComponentFixture<SpSolutionDescComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpSolutionDescComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpSolutionDescComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
