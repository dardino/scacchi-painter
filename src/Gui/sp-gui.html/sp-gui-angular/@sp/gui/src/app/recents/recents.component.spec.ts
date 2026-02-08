import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from "vitest";
import { RecentsComponent } from "./recents.component";

describe("RecentsComponent", () => {
  let component: RecentsComponent;
  let fixture: ComponentFixture<RecentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RecentsComponent],
    });
    fixture = TestBed.createComponent(RecentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
