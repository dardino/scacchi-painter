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

  it("should render the current solution count", () => {
    fixture.componentRef.setInput("solutionCount", 3);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("Solutions: 3");
  });

  it("should emit engineChanged when selection changes", () => {
    const emitSpy = vi.spyOn(component.engineChanged, "emit");
    const select = fixture.nativeElement.querySelector("select") as HTMLSelectElement;

    select.value = "Popeye";
    select.dispatchEvent(new Event("change"));

    expect(emitSpy).toHaveBeenCalledWith("Popeye");
  });

  it("should render provided engines in select", () => {
    fixture.componentRef.setInput("availableEngines", ["Popeye", "SpCore"]);
    fixture.componentRef.setInput("selectedEngine", "SpCore");
    fixture.detectChanges();

    const options = Array.from(fixture.nativeElement.querySelectorAll("option")) as HTMLOptionElement[];
    expect(options.map(o => o.value)).toEqual(["Popeye", "SpCore"]);
    expect((fixture.nativeElement.querySelector("select") as HTMLSelectElement).value).toBe("SpCore");
  });
});
