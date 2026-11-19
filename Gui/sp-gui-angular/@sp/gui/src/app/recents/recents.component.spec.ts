import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RecentsComponent } from "./recents.component";
import { LogService } from "../services/log.service";

describe("RecentsComponent", () => {
  let component: RecentsComponent;
  let fixture: ComponentFixture<RecentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RecentsComponent],
      providers: [
        {
          provide: DbmanagerService,
          useValue: {
            LoadFromService: vi.fn(async () => null),
            All: vi.fn(() => [{}]),
            CurrentIndex: vi.fn(() => 7),
          },
        },
        { provide: Router, useValue: { createUrlTree: vi.fn(() => "/list"), navigate: vi.fn(async () => true), navigateByUrl: vi.fn(async () => true) } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: LogService, useValue: { error: vi.fn() } },
      ],
    });
    fixture = TestBed.createComponent(RecentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should navigate to the last loaded problem after loading a local recent", async () => {
    const db = TestBed.inject(DbmanagerService);
    const router = TestBed.inject(Router);
    const recent = {
      source: "local" as const,
      meta: {
        type: "file" as const,
        itemName: "position.sp3",
        fullPath: "position.sp3",
        id: "position.sp3",
      },
    };

    await component.clickOnRecent(recent);

    expect(db.LoadFromService).toHaveBeenCalledWith(recent);
    expect(router.navigate).toHaveBeenCalledWith(["/edit", 7]);
  });
});
