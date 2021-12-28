import { GetLocationFromIndex, GetSquareColor } from "./helpers";

describe("Helpers", () => {
  it("GetLocationFromIndex", () => {
    const a8 = GetLocationFromIndex(0);
    expect(a8.column).toBe("ColA");
    expect(a8.traverse).toBe("Row8");

    const a1 = GetLocationFromIndex(56);
    expect(a1.column).toBe("ColA");
    expect(a1.traverse).toBe("Row1");

    const h1 = GetLocationFromIndex(63);
    expect(h1.column).toBe("ColH");
    expect(h1.traverse).toBe("Row1");

    const h8 = GetLocationFromIndex(7);
    expect(h8.column).toBe("ColH");
    expect(h8.traverse).toBe("Row8");
  });

  it("GetSquareColor", () => {
    const color0 = GetSquareColor({ column: "ColA", traverse: "Row1" });
    expect(color0).toBe("black");
    const color1 = GetSquareColor({ column: "ColH", traverse: "Row1" });
    expect(color1).toBe("white");
    const color2 = GetSquareColor({ column: "ColH", traverse: "Row2" });
    expect(color2).toBe("black");
    const color3 = GetSquareColor({ column: "ColH", traverse: "Row3" });
    expect(color3).toBe("white");
    const color4 = GetSquareColor({ column: "ColH", traverse: "Row4" });
    expect(color4).toBe("black");
  });

  it("GetSquareColor", () => {
    const color0 = GetSquareColor("ColA", "Row1" );
    expect(color0).toBe("black");
    const color1 = GetSquareColor("ColH", "Row1" );
    expect(color1).toBe("white");
    const color2 = GetSquareColor("ColH", "Row2" );
    expect(color2).toBe("black");
    const color3 = GetSquareColor("ColH", "Row3" );
    expect(color3).toBe("white");
    const color4 = GetSquareColor("ColH", "Row4" );
    expect(color4).toBe("black");
  });

});
