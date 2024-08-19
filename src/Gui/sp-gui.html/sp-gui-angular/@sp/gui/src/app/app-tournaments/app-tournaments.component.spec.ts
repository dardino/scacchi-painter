import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AppTournamentsComponent } from './app-tournaments.component';

describe('AppTournamentsComponent', () => {
  let component: AppTournamentsComponent;
  let fixture: ComponentFixture<AppTournamentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppTournamentsComponent],
      imports: [BrowserModule,HttpClientModule],
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
