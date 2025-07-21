import * as fs from "node:fs";
import * as path from "node:path";

interface PieceNameRow {
  index: number;
  code1: string;
  code2: string;
  fr: string;
  code3: string;
  de: string;
  code4: string;
  en: string;
}

/** load piecenam.txt from url https://raw.githubusercontent.com/thomas-maeder/popeye/refs/heads/develop/piecenam.txt */

const urlToFetch =
  "https://raw.githubusercontent.com/thomas-maeder/popeye/refs/heads/develop/piecenam.txt";

async function run() {
  await fetch(urlToFetch)
    .then((response) => response.text())
    .then((text) => {
      const filePath = path.join(__dirname, "piecenam.txt");
      fs.writeFileSync(filePath, text);
    })
    .catch((error) => {
      console.error("Error fetching piecenam.txt:", error);
    });

  const filePath = path.join(__dirname, "piecenam.txt");
  const lines = fs.readFileSync(filePath, "utf-8").split("\n");

  const result: PieceNameRow[] = [];

  for (const line of lines) {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith("/*") === false) continue;

    // Remove comment markers and split by '|'
    const parts = line
      .replace(/\/\*.*\*\//, "")
      .split("|")
      .map((s) => s.trim());

    // The columns are: [ '', code1, code2, fr, code3, de, code4, en ]
    if (parts.length < 8) continue;

    // Extract index from comment
    const indexMatch = line.match(/\/\*\s*(\d+)\s*\*\//);
    const index = indexMatch ? parseInt(indexMatch[1], 10) : -1;

    result.push({
      index,
      code1: parts[1],
      code2: parts[2],
      fr: parts[3],
      code3: parts[4],
      de: parts[5],
      code4: parts[6],
      en: parts[7],
    });
  }

  // write the result to a JSON file
  let outputFilePath = path.join(__dirname, "..", "@sp", "dbmanager", "assets");
  if (!fs.existsSync(outputFilePath)) {
    fs.mkdirSync(outputFilePath, { recursive: true });
  }
  outputFilePath = path.join(outputFilePath, "fairy_pieces.json");
  fs.writeFileSync(outputFilePath, JSON.stringify(result, null, 2));
}

run();
