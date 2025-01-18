export const Columns = [
  "ColA",
  "ColB",
  "ColC",
  "ColD",
  "ColE",
  "ColF",
  "ColG",
  "ColH",
] as const;
export type Columns = typeof Columns[number];

export const Traverse = [
  "Row8",
  "Row7",
  "Row6",
  "Row5",
  "Row4",
  "Row3",
  "Row2",
  "Row1",
] as const;
export type Traverse = typeof Traverse[number];
