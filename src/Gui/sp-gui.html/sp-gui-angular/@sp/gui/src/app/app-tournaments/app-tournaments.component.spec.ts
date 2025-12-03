import { ComponentFixture, TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AppTournamentsComponent } from './app-tournaments.component';

describe('AppTournamentsComponent', () => {
  let component: AppTournamentsComponent;
  let fixture: ComponentFixture<AppTournamentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppTournamentsComponent, BrowserModule],
      providers: [provideHttpClient(withInterceptorsFromDi())]
    });

    fixture = TestBed.createComponent(AppTournamentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
