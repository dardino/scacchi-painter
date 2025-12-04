import { ComponentFixture, TestBed } from '@angular/core/testing';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { AppTournamentsComponent } from './app-tournaments.component';
import { Tournament } from '@dtos/tournament';

describe('AppTournamentsComponent', () => {
  let component: AppTournamentsComponent;
  let fixture: ComponentFixture<AppTournamentsComponent>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppTournamentsComponent, BrowserModule, HttpClientTestingModule]
    });

    fixture = TestBed.createComponent(AppTournamentsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    // Mock the HTTP GET request
    const mockTournaments: Tournament[] = [
      { id: '1', title: 'Tournament 1', submissionDeadline: '2025-12-31', sections: [] } as Tournament,
      { id: '2', title: 'Tournament 2', submissionDeadline: '2026-01-31', sections: [] } as Tournament
    ];
    const req = httpMock.expectOne('api/listtournament');
    expect(req.request.method).toBe('GET');
    req.flush(mockTournaments);
  });

  afterEach(() => {
    // Verify that there are no outstanding HTTP requests
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display tournaments', () => {
    expect(component.message).toContain('1 - Tournament 1');
    expect(component.message).toContain('2 - Tournament 2');
  });
});
