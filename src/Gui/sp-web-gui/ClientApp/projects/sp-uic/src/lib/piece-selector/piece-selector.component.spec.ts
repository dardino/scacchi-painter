import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PieceSelectorComponent } from './piece-selector.component';

describe('PieceSelectorComponent', () => {
  let component: PieceSelectorComponent;
  let fixture: ComponentFixture<PieceSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PieceSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PieceSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
