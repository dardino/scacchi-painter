import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from 'vitest';
import { SpSolutionDescComponent } from "./sp-solution-desc.component";

describe("SpSolutionDescComponent", () => {
  let component: SpSolutionDescComponent;
  let fixture: ComponentFixture<SpSolutionDescComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ SpSolutionDescComponent ],
    });
    fixture = TestBed.createComponent(SpSolutionDescComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
