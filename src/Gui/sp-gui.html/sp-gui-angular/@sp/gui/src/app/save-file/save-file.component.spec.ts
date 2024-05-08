import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllMatIconRegistry } from '../registerIcons';
import { SaveFileComponent } from './save-file.component';

describe('SaveFileComponent', () => {
  let component: SaveFileComponent;
  let fixture: ComponentFixture<SaveFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaveFileComponent ],
      providers: [AllMatIconRegistry]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
