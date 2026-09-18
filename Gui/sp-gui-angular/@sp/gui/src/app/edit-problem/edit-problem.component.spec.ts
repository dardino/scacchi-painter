import { ComponentFixture, TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { RouterModule } from "@angular/router";
import { CurrentProblemService, SquareLocation } from "@sp/dbmanager/src/public-api";
import { of } from "rxjs";
import { EditProblemComponent, fenLikeTextPattern } from "./edit-problem.component";

describe("EditProblemComponent - Interactive Features", () => {
  let component: EditProblemComponent;
  let fixture: ComponentFixture<EditProblemComponent>;
  let pasteText: (text: string) => void;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [EditProblemComponent, RouterModule.forRoot([])],
      providers: [
        { provide: MatSnackBar, useValue: { open: vi.fn(), dismiss: vi.fn() } },
        {
          provide: MatDialog,
          useValue: {
            open: vi.fn().mockReturnValue({ afterClosed: () => of(null) }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditProblemComponent);
    component = fixture.componentInstance;
    pasteText = (text: string) => (component as unknown as { onPaste: ($event?: ClipboardEvent, patext?: string) => void })
      .onPaste(undefined, text);
    fixture.detectChanges();
  });

  describe("Clipboard paste detection", () => {
    const validFenLike = [
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "8/8/8/8/8/8/8/8",
      "8/8/8/8/8/8/8/8 w",
      "8/8/8/8/8/8/8/8 w KQkq - 0 1",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 e4:gn:Chameleon",
      "rnbqkbnr/pppppppp/8/4s3/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 d5:gn:Test",
      "rnbqkbnreta/ppppppppppp/83/83/83/83/83/83/83/PPPPPPPPPPP/ETARNBQKBNR w KQkq - 0 1",
      "*2q'1'2'3'4'5'6'7/'G'A'B'R'i'e'l'e/cxs''12''ABSCX/-c-x-s5/ETA-e-t-a2/KQRBNP2/eta'g'a'b2/kqrbnp2 w KQkq - 0 1 a8:GN:Imitator,h6::BlackHole",
      "*1RNBQKBNR w KQkq - 0 1",
      "-Krnbqbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/''gnNBQKBNR w KQkq - 0 1",
      "4k3/8/8/8/8/8/8/8 b - - 0 1",
    ];
    const recoverableFenLike = [
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - -1 1",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 d5:gn:Test extra",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 invalid",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 extra",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 foo bar baz",
    ];
    const invalidFenLike = [
      "hello world",
      "not a chess position",
      "{ \"foo\": \"bar\" }",
      "[1,2,3]",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR x KQkq - 0 1",
      "hello w KQkq - 0 1",
      "invalid/fen/structure",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 / junk",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 !!!",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 #notfen",
    ];

    it.each(validFenLike)("accepts valid FEN-like paste %s", (text) => {
      expect(fenLikeTextPattern.test(text)).toBe(true);
      const current = TestBed.inject(CurrentProblemService);
      const pasteFenSpy = vi.spyOn(current, "PasteFEN");
      pasteText(text);
      expect(pasteFenSpy).toHaveBeenCalledWith(text.trim());
    });

    it.each(recoverableFenLike)("accepts recoverable FEN-like paste %s", (text) => {
      expect(fenLikeTextPattern.test(text)).toBe(true);
      const current = TestBed.inject(CurrentProblemService);
      const pasteFenSpy = vi.spyOn(current, "PasteFEN");
      pasteText(text);
      expect(pasteFenSpy).toHaveBeenCalledWith(text.trim());
    });

    it.each(invalidFenLike)("rejects invalid pasted text %s", (text) => {
      expect(fenLikeTextPattern.test(text)).toBe(false);
      const current = TestBed.inject(CurrentProblemService);
      const pasteFenSpy = vi.spyOn(current, "PasteFEN");
      pasteText(text);
      expect(pasteFenSpy).not.toHaveBeenCalled();
    });
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

      component.clickOnCell(location, "left", { altKey: false, ctrlKey: false, shiftKey: false, metaKey: false });

      expect(component.editMode()).toBe("select");
    });

    it("should handle middle-click on cell", () => {
      const location: SquareLocation = { column: "ColA", traverse: "Row1" };
      component.editMode.set("add");
      component.pieceToAdd.set("wPa");

      component.clickOnCell(location, "middle", { altKey: false, ctrlKey: false, shiftKey: false, metaKey: false });

      expect(component.editMode()).toBe("select");
    });
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should keep live updates enabled without a buffered toggle", () => {
    expect((component as { toggleStreaming?: unknown }).toggleStreaming).toBeUndefined();
    expect((component as { streamSolutions?: unknown }).streamSolutions).toBeUndefined();
  });

  it("should open the engine settings dialog", () => {
    const dialog = TestBed.inject(MatDialog);

    component.openSolveEngineDialog();

    expect(dialog.open).toHaveBeenCalledOnce();
  });
});
