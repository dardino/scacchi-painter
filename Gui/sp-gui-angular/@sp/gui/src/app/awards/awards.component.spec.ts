import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Awards, DbmanagerService } from "@sp/dbmanager/src/public-api";
import { DialogService } from "@sp/ui-elements/src/lib/services/dialog.service";
import { of } from "rxjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AwardsComponent } from "./awards.component";

describe("AwardsComponent", () => {
  let component: AwardsComponent;
  let fixture: ComponentFixture<AwardsComponent>;
  let dbMock: {
    Awards: () => Awards[];
    SetAwards: ReturnType<typeof vi.fn>;
    SaveTemporary: ReturnType<typeof vi.fn>;
  };
  let dialogServiceMock: { verdictDialog: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    dbMock = {
      Awards: signal([
        {
          awardsTitle: "Spring Tournament",
          awardsDescription: "Regional event",
          awardsDate: "2026-01-01",
          awardsJudge: "Judge A",
          awardsProblems: [],
        },
      ]),
      SetAwards: vi.fn(),
      SaveTemporary: vi.fn(),
    };
    dialogServiceMock = {
      verdictDialog: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AwardsComponent],
      providers: [
        {
          provide: DbmanagerService,
          useValue: dbMock,
        },
        {
          provide: DialogService,
          useValue: dialogServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AwardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should render the awards list from the DB", () => {
    expect(fixture.nativeElement.textContent).toContain("Spring Tournament");
  });

  it("should update an existing verdict from the info dialog", async () => {
    const originalAward = {
      awardsTitle: "Spring Tournament",
      awardsDescription: "Regional event",
      awardsDate: "2026-01-01",
      awardsJudge: "Judge A",
      awardsProblems: [],
    };
    const updatedAward = {
      ...originalAward,
      awardsDescription: "Updated regional event",
      awardsJudge: "Judge Z",
    };

    dialogServiceMock.verdictDialog.mockReturnValue(of(updatedAward));

    await component.openVerdict(originalAward);

    expect(dialogServiceMock.verdictDialog).toHaveBeenCalledWith(originalAward, "edit");
    expect(dbMock.SetAwards).toHaveBeenCalledWith([updatedAward]);
    expect(dbMock.SaveTemporary).toHaveBeenCalled();
  });

  it("should save a newly created verdict into the DB", async () => {
    const createdAward = {
      awardsTitle: "New verdict",
      awardsDescription: "Description",
      awardsDate: "2026-02-02",
      awardsJudge: "Judge B",
      awardsProblems: [],
    };

    dialogServiceMock.verdictDialog.mockReturnValue(of(createdAward));

    await component.addNewVerdict();

    expect(dialogServiceMock.verdictDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        awardsTitle: "",
        awardsDescription: "",
        awardsProblems: [],
      }),
      "create",
    );
    expect(dbMock.SetAwards).toHaveBeenCalledWith([...dbMock.Awards(), createdAward]);
    expect(dbMock.SaveTemporary).toHaveBeenCalled();
  });
});
