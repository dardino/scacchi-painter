import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { OpenFileComponent } from "./open-file.component";
import { beforeEach, describe, expect, it } from "vitest";

describe("OpenfileComponent", () => {
  let component: OpenFileComponent;
  let fixture: ComponentFixture<OpenFileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OpenFileComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            queryParams: of({}),
            paramMap: of(new Map()),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(OpenFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
