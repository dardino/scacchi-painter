import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ToolbarEditComponent } from './toolbar-edit.component';

describe('EditToolbarComponent', () => {
  let component: ToolbarEditComponent;
  let fixture: ComponentFixture<ToolbarEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ToolbarEditComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
