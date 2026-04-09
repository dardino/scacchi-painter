import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToolbarEngineComponent } from "./toolbar-engine.component";

describe("ToolbarEngineComponent", () => {
  let component: ToolbarEngineComponent;
  let fixture: ComponentFixture<ToolbarEngineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToolbarEngineComponent],
    });
    fixture = TestBed.createComponent(ToolbarEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should emit toggleStreaming when streaming mode is toggled", () => {
    const emitSpy = vi.spyOn(component.toggleStreaming, "emit");

    component.toggleStreamingMode();

    expect(emitSpy).toHaveBeenCalledOnce();
  });

  it("should emit openEngineSettings when settings are opened", () => {
    const emitSpy = vi.spyOn(component.openEngineSettings, "emit");

    component.openEngineSettingsDialog();

    expect(emitSpy).toHaveBeenCalledOnce();
  });

  it("should render the current solution count", () => {
    fixture.componentRef.setInput("solutionCount", 3);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("Solutions: 3");
  });

  it("should render the selected engine label on the settings button", () => {
    fixture.componentRef.setInput("selectedEngine", "SpCore");
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("SpCore");
  });
});
