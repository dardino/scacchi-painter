import { ComponentFixture, TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';
import { AllMatIconRegistryService } from '@sp/ui-elements/src/lib/registerIcons';
import { SaveFileComponent } from './save-file.component';

describe('SaveFileComponent', () => {
  let component: SaveFileComponent;
  let fixture: ComponentFixture<SaveFileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SaveFileComponent],
      providers: [AllMatIconRegistryService]
    });
    fixture = TestBed.createComponent(SaveFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
