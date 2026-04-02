const rows = [
  `   1...d5-d6`,
  `   1.Re1-b1 ? threat:`,
  `1...g5-g6 2.Bc2*e4[bBe4->c8] Bh6-d2 #`,
  `1.Sc6-a5 Rf5-f4 2.Sa5-b3 Bh4-g3 3.Rd8*d4 + Rf4*d4 #`,
  `3.Rd8*d4 + Rf4*d4 #`,
];

describe("move Parser Tester", () => {
  test("controllo split movimenti", () => {
    expect(true).toBeTruthy();
  });

  test.each(rows)("%s", (row) => {
    expect(row).toBeTruthy();
  });
});
