import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConditionsDialogComponent } from './conditions-dialog.component';

describe('ConditionsDialogComponent', () => {
  let component: ConditionsDialogComponent;
  let fixture: ComponentFixture<ConditionsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConditionsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConditionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
