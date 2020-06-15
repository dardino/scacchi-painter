import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarEngineComponent } from './toolbar-engine.component';

describe('ToolbarEngineComponent', () => {
  let component: ToolbarEngineComponent;
  let fixture: ComponentFixture<ToolbarEngineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolbarEngineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
