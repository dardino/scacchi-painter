import { ComponentFixture, TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';
import { ThirdPartyImports } from '../thirdPartyImports';
import { FileSourceSelectorComponent } from './file-source-selector.component';

describe('FileSourceSelectorComponent', () => {
  let component: FileSourceSelectorComponent;
  let fixture: ComponentFixture<FileSourceSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ FileSourceSelectorComponent, ...ThirdPartyImports ]
    });
    fixture = TestBed.createComponent(FileSourceSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
