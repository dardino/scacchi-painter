import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from "vitest";
import { provideServiceWorker } from "@angular/service-worker";
import { ConfigurationComponent } from "./configuration.component";

describe("ConfigurationComponent", () => {
  let component: ConfigurationComponent;
  let fixture: ComponentFixture<ConfigurationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ConfigurationComponent],
      providers: [
        provideServiceWorker("ngsw-worker.js", { enabled: false }),
      ],
    });
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
