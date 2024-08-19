import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThirdPartyImports } from '../thirdPartyImports';
import { DbsourceComponent } from './dbsource.component';

describe('DbsourceComponent', () => {
  let component: DbsourceComponent;
  let fixture: ComponentFixture<DbsourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DbsourceComponent],
      imports: [...ThirdPartyImports]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DbsourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
