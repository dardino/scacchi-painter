import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SaveFileComponent } from './save-file.component';

describe('SaveFileComponent', () => {
  let component: SaveFileComponent;
  let fixture: ComponentFixture<SaveFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatSnackBarModule],
      declarations: [ SaveFileComponent ]
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
