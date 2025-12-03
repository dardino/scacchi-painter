import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from 'vitest';
import { ProblemPublicationComponent } from "./problem-publication.component";

describe("ProblemPublicationComponent", () => {
  let component: ProblemPublicationComponent;
  let fixture: ComponentFixture<ProblemPublicationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ ProblemPublicationComponent ],
    });
    fixture = TestBed.createComponent(ProblemPublicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
