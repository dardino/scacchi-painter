import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpUicComponent } from './sp-uic.component';

describe('SpUicComponent', () => {
  let component: SpUicComponent;
  let fixture: ComponentFixture<SpUicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpUicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpUicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
