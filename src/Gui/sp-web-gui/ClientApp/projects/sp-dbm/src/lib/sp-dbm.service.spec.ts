import { TestBed } from "@angular/core/testing";

import { SpDbmService, GetSquareColor, GetSquareIndex, GetLocationFromIndex } from "./sp-dbm.service";

describe("SpDbmService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: SpDbmService = TestBed.get(SpDbmService);
    expect(service).toBeTruthy();
  });
});

describe("squarecolor", () => {
  it("A1 --> black", () => {
    expect(GetSquareColor("ColA", "Row1")).toBe("black");
  });
  it("A2 --> white", () => {
    expect(GetSquareColor("ColA", "Row2")).toBe("white");
  });
  it("A3 --> black", () => {
    expect(GetSquareColor("ColA", "Row3")).toBe("black");
  });
  it("A4 --> white", () => {
    expect(GetSquareColor("ColA", "Row4")).toBe("white");
  });
  it("A5 --> black", () => {
    expect(GetSquareColor("ColA", "Row5")).toBe("black");
  });
  it("A6 --> white", () => {
    expect(GetSquareColor("ColA", "Row6")).toBe("white");
  });
  it("A7 --> black", () => {
    expect(GetSquareColor("ColA", "Row7")).toBe("black");
  });
  it("A8 --> white", () => {
    expect(GetSquareColor("ColA", "Row8")).toBe("white");
  });
  it("B1 --> white", () => {
    expect(GetSquareColor("ColB", "Row1")).toBe("white");
  });
  it("B2 --> black", () => {
    expect(GetSquareColor("ColB", "Row2")).toBe("black");
  });
  it("B3 --> white", () => {
    expect(GetSquareColor("ColB", "Row3")).toBe("white");
  });
  it("B4 --> black", () => {
    expect(GetSquareColor("ColB", "Row4")).toBe("black");
  });
  it("B5 --> white", () => {
    expect(GetSquareColor("ColB", "Row5")).toBe("white");
  });
  it("B6 --> black", () => {
    expect(GetSquareColor("ColB", "Row6")).toBe("black");
  });
  it("B7 --> white", () => {
    expect(GetSquareColor("ColB", "Row7")).toBe("white");
  });
  it("B8 --> black", () => {
    expect(GetSquareColor("ColB", "Row8")).toBe("black");
  });
  it("C1 --> black", () => {
    expect(GetSquareColor("ColC", "Row1")).toBe("black");
  });
  it("C2 --> white", () => {
    expect(GetSquareColor("ColC", "Row2")).toBe("white");
  });
  it("C3 --> black", () => {
    expect(GetSquareColor("ColC", "Row3")).toBe("black");
  });
  it("C4 --> white", () => {
    expect(GetSquareColor("ColC", "Row4")).toBe("white");
  });
  it("C5 --> black", () => {
    expect(GetSquareColor("ColC", "Row5")).toBe("black");
  });
  it("C6 --> white", () => {
    expect(GetSquareColor("ColC", "Row6")).toBe("white");
  });
  it("C7 --> black", () => {
    expect(GetSquareColor("ColC", "Row7")).toBe("black");
  });
  it("C8 --> white", () => {
    expect(GetSquareColor("ColC", "Row8")).toBe("white");
  });
  it("D1 --> white", () => {
    expect(GetSquareColor("ColD", "Row1")).toBe("white");
  });
  it("D2 --> black", () => {
    expect(GetSquareColor("ColD", "Row2")).toBe("black");
  });
  it("D3 --> white", () => {
    expect(GetSquareColor("ColD", "Row3")).toBe("white");
  });
  it("D4 --> black", () => {
    expect(GetSquareColor("ColD", "Row4")).toBe("black");
  });
  it("D5 --> white", () => {
    expect(GetSquareColor("ColD", "Row5")).toBe("white");
  });
  it("D6 --> black", () => {
    expect(GetSquareColor("ColD", "Row6")).toBe("black");
  });
  it("D7 --> white", () => {
    expect(GetSquareColor("ColD", "Row7")).toBe("white");
  });
  it("D8 --> black", () => {
    expect(GetSquareColor("ColD", "Row8")).toBe("black");
  });
  it("E1 --> black", () => {
    expect(GetSquareColor("ColE", "Row1")).toBe("black");
  });
  it("E2 --> white", () => {
    expect(GetSquareColor("ColE", "Row2")).toBe("white");
  });
  it("E3 --> black", () => {
    expect(GetSquareColor("ColE", "Row3")).toBe("black");
  });
  it("E4 --> white", () => {
    expect(GetSquareColor("ColE", "Row4")).toBe("white");
  });
  it("E5 --> black", () => {
    expect(GetSquareColor("ColE", "Row5")).toBe("black");
  });
  it("E6 --> white", () => {
    expect(GetSquareColor("ColE", "Row6")).toBe("white");
  });
  it("E7 --> black", () => {
    expect(GetSquareColor("ColE", "Row7")).toBe("black");
  });
  it("E8 --> white", () => {
    expect(GetSquareColor("ColE", "Row8")).toBe("white");
  });
  it("F1 --> white", () => {
    expect(GetSquareColor("ColF", "Row1")).toBe("white");
  });
  it("F2 --> black", () => {
    expect(GetSquareColor("ColF", "Row2")).toBe("black");
  });
  it("F3 --> white", () => {
    expect(GetSquareColor("ColF", "Row3")).toBe("white");
  });
  it("F4 --> black", () => {
    expect(GetSquareColor("ColF", "Row4")).toBe("black");
  });
  it("F5 --> white", () => {
    expect(GetSquareColor("ColF", "Row5")).toBe("white");
  });
  it("F6 --> black", () => {
    expect(GetSquareColor("ColF", "Row6")).toBe("black");
  });
  it("F7 --> white", () => {
    expect(GetSquareColor("ColF", "Row7")).toBe("white");
  });
  it("F8 --> black", () => {
    expect(GetSquareColor("ColF", "Row8")).toBe("black");
  });
  it("G1 --> black", () => {
    expect(GetSquareColor("ColG", "Row1")).toBe("black");
  });
  it("G2 --> white", () => {
    expect(GetSquareColor("ColG", "Row2")).toBe("white");
  });
  it("G3 --> black", () => {
    expect(GetSquareColor("ColG", "Row3")).toBe("black");
  });
  it("G4 --> white", () => {
    expect(GetSquareColor("ColG", "Row4")).toBe("white");
  });
  it("G5 --> black", () => {
    expect(GetSquareColor("ColG", "Row5")).toBe("black");
  });
  it("G6 --> white", () => {
    expect(GetSquareColor("ColG", "Row6")).toBe("white");
  });
  it("G7 --> black", () => {
    expect(GetSquareColor("ColG", "Row7")).toBe("black");
  });
  it("G8 --> white", () => {
    expect(GetSquareColor("ColG", "Row8")).toBe("white");
  });
  it("H1 --> white", () => {
    expect(GetSquareColor("ColH", "Row1")).toBe("white");
  });
  it("H2 --> black", () => {
    expect(GetSquareColor("ColH", "Row2")).toBe("black");
  });
  it("H3 --> white", () => {
    expect(GetSquareColor("ColH", "Row3")).toBe("white");
  });
  it("H4 --> black", () => {
    expect(GetSquareColor("ColH", "Row4")).toBe("black");
  });
  it("H5 --> white", () => {
    expect(GetSquareColor("ColH", "Row5")).toBe("white");
  });
  it("H6 --> black", () => {
    expect(GetSquareColor("ColH", "Row6")).toBe("black");
  });
  it("H7 --> white", () => {
    expect(GetSquareColor("ColH", "Row7")).toBe("white");
  });
  it("H8 --> black", () => {
    expect(GetSquareColor("ColH", "Row8")).toBe("black");
  });
});

describe("square index", () => {
  it("A8 --> 1 ", () => { expect(GetSquareIndex("ColA", "Row8")).toEqual(1); });
  it("B8 --> 2 ", () => { expect(GetSquareIndex("ColB", "Row8")).toEqual(2); });
  it("C8 --> 3 ", () => { expect(GetSquareIndex("ColC", "Row8")).toEqual(3); });
  it("D8 --> 4 ", () => { expect(GetSquareIndex("ColD", "Row8")).toEqual(4); });
  it("E8 --> 5 ", () => { expect(GetSquareIndex("ColE", "Row8")).toEqual(5); });
  it("F8 --> 6 ", () => { expect(GetSquareIndex("ColF", "Row8")).toEqual(6); });
  it("G8 --> 7 ", () => { expect(GetSquareIndex("ColG", "Row8")).toEqual(7); });
  it("H8 --> 8 ", () => { expect(GetSquareIndex("ColH", "Row8")).toEqual(8); });
  it("A7 --> 9 ", () => { expect(GetSquareIndex("ColA", "Row7")).toEqual(9 ); });
  it("B7 --> 10", () => { expect(GetSquareIndex("ColB", "Row7")).toEqual(10); });
  it("C7 --> 11", () => { expect(GetSquareIndex("ColC", "Row7")).toEqual(11); });
  it("D7 --> 12", () => { expect(GetSquareIndex("ColD", "Row7")).toEqual(12); });
  it("E7 --> 13", () => { expect(GetSquareIndex("ColE", "Row7")).toEqual(13); });
  it("F7 --> 14", () => { expect(GetSquareIndex("ColF", "Row7")).toEqual(14); });
  it("G7 --> 15", () => { expect(GetSquareIndex("ColG", "Row7")).toEqual(15); });
  it("H7 --> 16", () => { expect(GetSquareIndex("ColH", "Row7")).toEqual(16); });
  it("A7 --> 57", () => { expect(GetSquareIndex("ColA", "Row1")).toEqual(57); });
  it("B7 --> 58", () => { expect(GetSquareIndex("ColB", "Row1")).toEqual(58); });
  it("C7 --> 59", () => { expect(GetSquareIndex("ColC", "Row1")).toEqual(59); });
  it("D7 --> 60", () => { expect(GetSquareIndex("ColD", "Row1")).toEqual(60); });
  it("E7 --> 61", () => { expect(GetSquareIndex("ColE", "Row1")).toEqual(61); });
  it("F7 --> 62", () => { expect(GetSquareIndex("ColF", "Row1")).toEqual(62); });
  it("G7 --> 63", () => { expect(GetSquareIndex("ColG", "Row1")).toEqual(63); });
  it("H7 --> 64", () => { expect(GetSquareIndex("ColH", "Row1")).toEqual(64); });
});
describe("square from index", () => {
  it(" 1  --> A8", () => { expect(GetSquareIndex(GetLocationFromIndex( 1  ))).toEqual(1  ); });
  it(" 2  --> B8", () => { expect(GetSquareIndex(GetLocationFromIndex( 2  ))).toEqual(2  ); });
  it(" 3  --> C8", () => { expect(GetSquareIndex(GetLocationFromIndex( 3  ))).toEqual(3  ); });
  it(" 4  --> D8", () => { expect(GetSquareIndex(GetLocationFromIndex( 4  ))).toEqual(4  ); });
  it(" 5  --> E8", () => { expect(GetSquareIndex(GetLocationFromIndex( 5  ))).toEqual(5  ); });
  it(" 6  --> F8", () => { expect(GetSquareIndex(GetLocationFromIndex( 6  ))).toEqual(6  ); });
  it(" 7  --> G8", () => { expect(GetSquareIndex(GetLocationFromIndex( 7  ))).toEqual(7  ); });
  it(" 8  --> H8", () => { expect(GetSquareIndex(GetLocationFromIndex( 8  ))).toEqual(8  ); });
  it(" 9  --> A7", () => { expect(GetSquareIndex(GetLocationFromIndex( 9  ))).toEqual(9  ); });
  it(" 10 --> B7", () => { expect(GetSquareIndex(GetLocationFromIndex( 10 ))).toEqual(10 ); });
  it(" 11 --> C7", () => { expect(GetSquareIndex(GetLocationFromIndex( 11 ))).toEqual(11 ); });
  it(" 12 --> D7", () => { expect(GetSquareIndex(GetLocationFromIndex( 12 ))).toEqual(12 ); });
  it(" 13 --> E7", () => { expect(GetSquareIndex(GetLocationFromIndex( 13 ))).toEqual(13 ); });
  it(" 14 --> F7", () => { expect(GetSquareIndex(GetLocationFromIndex( 14 ))).toEqual(14 ); });
  it(" 15 --> G7", () => { expect(GetSquareIndex(GetLocationFromIndex( 15 ))).toEqual(15 ); });
  it(" 16 --> H7", () => { expect(GetSquareIndex(GetLocationFromIndex( 16 ))).toEqual(16 ); });
  it(" 57 --> A1", () => { expect(GetSquareIndex(GetLocationFromIndex( 57 ))).toEqual(57); });
  it(" 58 --> B1", () => { expect(GetSquareIndex(GetLocationFromIndex( 58 ))).toEqual(58); });
  it(" 59 --> C1", () => { expect(GetSquareIndex(GetLocationFromIndex( 59 ))).toEqual(59); });
  it(" 60 --> D1", () => { expect(GetSquareIndex(GetLocationFromIndex( 60 ))).toEqual(60); });
  it(" 61 --> E1", () => { expect(GetSquareIndex(GetLocationFromIndex( 61 ))).toEqual(61); });
  it(" 62 --> F1", () => { expect(GetSquareIndex(GetLocationFromIndex( 62 ))).toEqual(62); });
  it(" 63 --> G1", () => { expect(GetSquareIndex(GetLocationFromIndex( 63 ))).toEqual(63); });
  it(" 64 --> H1", () => { expect(GetSquareIndex(GetLocationFromIndex( 64 ))).toEqual(64); });
});
