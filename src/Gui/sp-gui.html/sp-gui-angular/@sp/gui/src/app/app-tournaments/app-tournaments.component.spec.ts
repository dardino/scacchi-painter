import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppTournamentsComponent } from './app-tournaments.component';

describe('AppTournamentsComponent', () => {
  let component: AppTournamentsComponent;
  let fixture: ComponentFixture<AppTournamentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppTournamentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppTournamentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
