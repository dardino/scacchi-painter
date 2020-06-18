import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarPieceComponent } from './toolbar-piece.component';

describe('ToolbarPieceComponent', () => {
  let component: ToolbarPieceComponent;
  let fixture: ComponentFixture<ToolbarPieceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolbarPieceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarPieceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
