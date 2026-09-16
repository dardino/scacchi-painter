import { ComponentFixture, TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { SnapshotsManagerComponent } from "./snapshots-manager.component";

describe("SnapshotsManagerComponent", () => {
  let component: SnapshotsManagerComponent;
  let fixture: ComponentFixture<SnapshotsManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnapshotsManagerComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(SnapshotsManagerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
