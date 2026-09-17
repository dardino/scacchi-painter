import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from "vitest";
import { PrivacyAndTermsComponent } from "./privacy-and-terms.component";

describe("PrivacyAndTermsComponent", () => {
  let component: PrivacyAndTermsComponent;
  let fixture: ComponentFixture<PrivacyAndTermsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyAndTermsComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(PrivacyAndTermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should explain that data is sent only via selected cloud storage providers", () => {
    const text = fixture.nativeElement.textContent as string;
    const links = Array.from(fixture.nativeElement.querySelectorAll("a")).map((link: Element) => (link as HTMLAnchorElement).href);

    expect(text).toContain("OneDrive");
    expect(text).toContain("Dropbox");
    expect(links).toContain("https://privacy.microsoft.com/privacystatement");
    expect(links).toContain("https://www.dropbox.com/terms");
  });
});
