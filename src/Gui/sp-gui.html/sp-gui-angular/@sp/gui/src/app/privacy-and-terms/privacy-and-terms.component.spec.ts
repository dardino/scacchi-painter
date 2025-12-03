import { ComponentFixture, TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';
import { PrivacyAndTermsComponent } from './privacy-and-terms.component';

describe('PrivacyAndTermsComponent', () => {
  let component: PrivacyAndTermsComponent;
  let fixture: ComponentFixture<PrivacyAndTermsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyAndTermsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivacyAndTermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
