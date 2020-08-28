import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProblemPublicationComponent } from './problem-publication.component';

describe('ProblemPublicationComponent', () => {
  let component: ProblemPublicationComponent;
  let fixture: ComponentFixture<ProblemPublicationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProblemPublicationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProblemPublicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
