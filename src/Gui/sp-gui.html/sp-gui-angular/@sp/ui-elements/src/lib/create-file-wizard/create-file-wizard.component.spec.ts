import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFileWizardComponent } from './create-file-wizard.component';

describe('CreateFileWizardComponent', () => {
  let component: CreateFileWizardComponent;
  let fixture: ComponentFixture<CreateFileWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateFileWizardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateFileWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
