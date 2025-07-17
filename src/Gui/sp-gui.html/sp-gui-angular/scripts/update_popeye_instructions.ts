/* eslint-disable no-console */
// step1: download the latest popeye instructions from https://raw.githubusercontent.com/thomas-maeder/popeye/refs/heads/develop/py-engl.txt
import * as fs from "node:fs/promises";
import * as path from "node:path";
import urlsConfig from "./urlsConfig.json";

async function download() {
  await fetch(urlsConfig.instructions)
    .then((response) => response.text())
    .then((text) => {
      const filePath = path.join(__dirname, "instructions.txt");
      return fs.writeFile(filePath, text);
    })
    .then(() => {
      console.log("instructions.txt downloaded");
    })
    .catch((error) => {
      console.error("Error fetching instructions.txt:", error);
    });
}

// Elenco delle sezioni principali da estrarre
const sectionHeaders = [
  "Starting popeye:",
  "Commandline parameters:",
  "Stopping Popeye:",
  "Description of the input language of popeye:",
  "Here comes a sample:",
  "Special things depending on your operating system:",
];

function normalizeHeader(line: string) {
  return sectionHeaders.find((header) =>
    line.trim().toLowerCase().startsWith(header.toLowerCase())
  );
}

function extractSections(lines: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  let currentSection: string | null = null;
  let buffer: string[] = [];

  for (const line of lines) {
    const header = normalizeHeader(line);
    if (header) {
      if (currentSection && buffer.length > 0) {
        result[currentSection] = buffer.join("\n").trim();
        buffer = [];
      }
      currentSection = header.replace(":", "");
    } else if (currentSection) {
      buffer.push(line);
    }
  }
  if (currentSection && buffer.length > 0) {
    result[currentSection] = buffer.join("\n").trim();
  }
  return result;
}

function extractCommandlineParameters(text: string): Record<string, string> {
  const params: Record<string, string> = {};
  const lines = text.split(/\r?\n/);

  // Estrai i parametri
  let currentParam: string | null = null;
  let buffer: string[] = [];
  for (const line of lines) {
    const match = line.match(/^(-\w+)/);
    if (match) {
      // Salva il parametro precedente
      if (currentParam) {
        params[currentParam] = buffer.join(" ").replace(/\s+/g, " ").trim();
      }
      currentParam = match[1];
      buffer = [line.replace(currentParam, "").trim()];
    } else if (currentParam) {
      buffer.push(line.trim());
    }
  }
  // Salva l'ultimo parametro
  if (currentParam) {
    params[currentParam] = buffer.join(" ").replace(/\s+/g, " ").trim();
  }

  return params;
}

const rxCondition = /^\t([\w&]+)($|\t| {4})/i;
function extractConditions(text: string): Record<string, { name: string; description: string[] }> {
  const lines = text.split(/\r?\n/);
  // search line index containing "The following conditions are implemented:"
  const index = lines.findIndex((line) =>
    line.toLowerCase().includes("the following conditions are implemented:")
  );
  if (index === -1) {
    return {};
  }

  const conditions: Record<string, { name: string; description: string[] }> = {};

  let lastCondition = "";
  for (let i = index + 1; i < lines.length; i++) {
    const line = lines[i];
    const matches = line.match(rxCondition);
    if (matches) {
      lastCondition = matches[1];
    }
    if (lastCondition === "") continue;
    if (line === "") break; // mi fermo alla prima riga vuota

    if (conditions[lastCondition] == null) {
      conditions[lastCondition] = {
        name: lastCondition,
        description: [],
      };
    }
    const txt2Add = line.replace(rxCondition, "").trim();
    if (txt2Add === "") continue;

    conditions[lastCondition].description.push(txt2Add);

  }

  return conditions;
}

type PossibleCommandInfoType = string | Record<string, {
    name: string;
    description: string[];
}>

type Commands = Record<string, Record<string, PossibleCommandInfoType>>

function extractCommandsFromText(
  text: string
): Commands {
  const commands: Commands = {};
  // splitto per riga
  const lines = text.split(/\r?\n/);
  // cerco la riga contenente "following commands may be used:"
  const index = lines.findIndex((line) =>
    line.toLowerCase().includes("following commands may be used:")
  );
  if (index === -1) {
    return commands;
  }
  // cerco la prossima riga che non è vuota
  let startIndex = index + 1;
  while (true) {
    const content = lines[startIndex].trim();
    if (content == null) return commands;
    if (content != "") break;
    startIndex++;
  }
  // i comandi sono elencati nelle rige successive a questa fino a trovare un'altra riga vuota
  let commandBuffer = "";
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line == "") break;
    commandBuffer += line;
  }
  const allCommands = commandBuffer
    .split(",")
    .map((command) => command.trim())
    .filter((command) => !!command)
    .reduce((aggr, comm) => {
      return {
        ...aggr,
        [comm.toLowerCase()]: "",
      } satisfies Record<string, string>;
    }, {} as Record<string, string>);
  // le righe successive sono le descrizioni dei comandi
  const regex = new RegExp(`^ - (${Object.keys(allCommands).join("|")})`, "i");
  let currentCommand = "";
  let first = true;
  while (true) {
    const line = lines[startIndex];
    if (line == null) break; // esco se raggiungo la fine del file
    // se la riga comincia con " - " e con uno dei comandi mi segno che le prossime righe vanno
    // a formare la descrizione di quel comando
    if (regex.test(line)) {
      currentCommand = line.match(regex)![1]!.toLowerCase();
      first = true;
    }
    if (allCommands[currentCommand] != null) {
      allCommands[currentCommand] += (first ? "" : "\n") + line;
      first = false;
    }
    startIndex++;
  }

  // from "condition" extract all conditions
  const conditions = extractConditions(allCommands.condition);

  commands.CommandList = {
    ...allCommands,
    condition: conditions,
  };

  return commands;
}

async function main() {
  await download();
  const inputPath = path.join(__dirname, "instructions.txt");
  const content = await fs.readFile(inputPath, "utf-8");
  const lines = content.split(/\r?\n/);
  const sections = extractSections(lines);
  const jsonOut = {
    CLI_Parameters: extractCommandlineParameters(
      sections["Commandline parameters"]
    ),
    Commands: extractCommandsFromText(
      sections["Description of the input language of popeye"]
    ),
  };
  const outputFilePath = path.join(__dirname, "..", "@sp", "dbmanager", "assets", "popeye_instructions.json");
  await fs.writeFile(outputFilePath, JSON.stringify(jsonOut, null, 2), "utf-8");
  console.log(`Istruzioni estratte in ${outputFilePath}`);
}

main();
