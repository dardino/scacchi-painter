import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { describe, expect, it, vi } from "vitest";
import { SolveEngineDialogComponent, SolveEngineDialogData } from "./solve-engine-dialog.component";

function createDialogData(overrides?: Partial<SolveEngineDialogData>): SolveEngineDialogData {
  return {
    availableEngines: ["Popeye", "SpCore", "SpCoreJs"],
    engine: "Popeye",
    engineConfig: null,
    engineConfigurationsByEngine: null,
    ...overrides,
  };
}

describe("SolveEngineDialogComponent", () => {
  let fixture: ComponentFixture<SolveEngineDialogComponent>;

  const createComponent = (data?: Partial<SolveEngineDialogData>) => {
    TestBed.configureTestingModule({
      imports: [SolveEngineDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: createDialogData(data) },
      ],
    });

    fixture = TestBed.createComponent(SolveEngineDialogComponent);
    fixture.detectChanges();

    return fixture.componentInstance;
  };

  it("shows Popeye options in the dialog by default", () => {
    createComponent();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain("Popeye options");
    expect(root.textContent).toContain("NoBoard");
    expect(root.textContent).toContain("Try");
    expect(root.textContent).not.toContain("ShowAllDefenses");
  });

  it("shows SpCore options when SpCore engine is selected", () => {
    const component = createComponent({ engine: "SpCore" });

    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain("SP-Engine (Rust) options");
    expect(root.textContent).toContain("ShowAttempts");
    expect(root.textContent).toContain("MaxSolutions");
    expect(root.textContent).toContain("RefutationsCount");
    expect(root.textContent).toContain("ShowAllDefenses");
    expect(root.textContent).not.toContain("NoBoard");
    expect(component.optionState.ShowAttempts?.enabled).toBeTruthy();
  });

  it("shows argument inputs for enabled options with args", () => {
    const component = createComponent({
      engine: "SpCoreJs",
      engineConfigurationsByEngine: {
        SpCoreJs: {
          MaxSolutions: ["3"],
        },
      },
    });

    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain("SP-Engine (JS) options");
    expect(root.textContent).toContain("Arg 1");

    expect(component.optionState.MaxSolutions?.enabled).toBeTruthy();
    expect(component.optionState.MaxSolutions?.values[0]).toBe("3");

    const input = root.querySelector("input[matinput]") as HTMLInputElement | null;
    expect(input).toBeTruthy();
  });
});
