import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThirdPartyImports } from '../thirdPartyImports';
import { FileSourceSelectorComponent } from './file-source-selector.component';

describe('FileSourceSelectorComponent', () => {
  let component: FileSourceSelectorComponent;
  let fixture: ComponentFixture<FileSourceSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileSourceSelectorComponent ],
      imports: [...ThirdPartyImports]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileSourceSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
