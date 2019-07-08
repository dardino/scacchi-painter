import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpDbmComponent } from './sp-dbm.component';

describe('SpDbmComponent', () => {
  let component: SpDbmComponent;
  let fixture: ComponentFixture<SpDbmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpDbmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpDbmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
