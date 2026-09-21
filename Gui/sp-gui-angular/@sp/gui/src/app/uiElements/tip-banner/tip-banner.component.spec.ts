import { ComponentFixture, TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TipBannerComponent } from "./tip-banner.component";

describe("TipBannerComponent", () => {
  let fixture: ComponentFixture<TipBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipBannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TipBannerComponent);
    fixture.componentRef.setInput("tip", "Use Ctrl+S to save your board state.");
    fixture.componentRef.setInput("hasNext", true);
    fixture.componentRef.setInput("hasPrev", true);
    fixture.detectChanges();
  });

  it("renders the title and tip text", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Did you know?");
    expect(compiled.textContent).toContain("Use Ctrl+S to save your board state.");
  });

  it("emits navigation and hide events", () => {
    const nextSpy = vi.fn();
    const prevSpy = vi.fn();
    const hideSpy = vi.fn();

    fixture.componentInstance.nextTip.subscribe(nextSpy);
    fixture.componentInstance.prevTip.subscribe(prevSpy);
    fixture.componentInstance.hideTips.subscribe(hideSpy);

    fixture.componentInstance.nextTip.emit();
    fixture.componentInstance.prevTip.emit();
    fixture.componentInstance.hideTips.emit();

    expect(nextSpy).toHaveBeenCalledTimes(1);
    expect(prevSpy).toHaveBeenCalledTimes(1);
    expect(hideSpy).toHaveBeenCalledTimes(1);
  });
});
