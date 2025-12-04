import { ComponentFixture, TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MatSnackBar } from "@angular/material/snack-bar";
import { RouterModule } from "@angular/router";
import { EditProblemComponent } from "./edit-problem.component";
import { SquareLocation } from "@sp/dbmanager/src/public-api";

describe("EditProblemComponent - Interactive Features", () => {
  let component: EditProblemComponent;
  let fixture: ComponentFixture<EditProblemComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [EditProblemComponent, RouterModule.forRoot([])],
      providers: [
        { provide: MatSnackBar, useValue: { open: vi.fn(), dismiss: vi.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditProblemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe("Add Piece Functionality", () => {
    it("should set editMode to 'add' and pieceToAdd when setPieceToAdd is called", () => {
      component.setPieceToAdd("wPa");
      expect(component.editMode()).toBe("add");
      expect(component.pieceToAdd()).toBe("wPa");
    });

    it("should reset to select mode when setPieceToAdd is called with same piece", () => {
      component.setPieceToAdd("wPa");
      component.setPieceToAdd("wPa");
      expect(component.editMode()).toBe("select");
      expect(component.pieceToAdd()).toBeNull();
    });

    it("should toggle between add and select mode", () => {
      component.setPieceToAdd("wPa");
      expect(component.editMode()).toBe("add");
      expect(component.pieceToAdd()).toBe("wPa");

      component.setPieceToAdd(null);
      expect(component.editMode()).toBe("select");
      expect(component.pieceToAdd()).toBeNull();
    });
  });

  describe("Edit Mode", () => {
    it("should change editMode when editModeChanged is called", () => {
      component.editModeChanged("remove");
      expect(component.editMode()).toBe("remove");
    });

    it("should reset state when switching modes", () => {
      component.pieceToAdd.set("wPa");
      component.editMode.set("add");
      component.editModeChanged("select");
      expect(component.pieceToAdd()).toBeNull();
    });

    it("should set remove mode with X cursor", () => {
      component.editModeChanged("remove");
      expect(component.editMode()).toBe("remove");
      expect(component.boardCursor()?.figurine).toBe("X");
    });
  });

  describe("Board Cursor", () => {
    it("should return null cursor in select mode", () => {
      component.editMode.set("select");
      expect(component.boardCursor()?.figurine).toBeNull();
    });

    it("should return X cursor in remove mode", () => {
      component.editMode.set("remove");
      expect(component.boardCursor()?.figurine).toBe("X");
    });

    it("should return pieceToAdd cursor in add mode", () => {
      component.editMode.set("add");
      component.pieceToAdd.set("wPa");
      expect(component.boardCursor()?.figurine).toBe("wPa");
    });

    it("should return null cursor when pieceToAdd is null in add mode", () => {
      component.editMode.set("add");
      component.pieceToAdd.set(null);
      expect(component.boardCursor()?.figurine).toBeNull();
    });
  });

  describe("Cell Interactions", () => {
    it("should reset state when currentCellChange is called with null", () => {
      component.editMode.set("add");
      component.pieceToAdd.set("wPa");

      component.currentCellChange(null);

      expect(component.pieceToAdd()).toBeNull();
    });

    it("should handle left-click on cell", () => {
      const location: SquareLocation = { column: "ColA", traverse: "Row1" };
      component.editMode.set("select");

      component.clickOnCell(location, "left");

      expect(component.editMode()).toBe("select");
    });

    it("should handle middle-click on cell", () => {
      const location: SquareLocation = { column: "ColA", traverse: "Row1" };
      component.editMode.set("add");
      component.pieceToAdd.set("wPa");

      component.clickOnCell(location, "middle");

      expect(component.editMode()).toBe("select");
    });
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });
});
