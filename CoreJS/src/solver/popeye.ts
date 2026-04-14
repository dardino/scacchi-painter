import { ProblemInput } from "./types";

export type PopeyeParse = {
  fen?: string;
  stipulation?: string;
  raw?: string;
};

/**
 * Parse a small Popeye snippet for common fields.
 * Recognizes lines like: "Stipulation: #2" and "FEN: <fen>"
 */
export function parsePopeye(snippet: string | ProblemInput): PopeyeParse {
  const text = typeof snippet === "string" ? snippet : (snippet.popeye || "");
  if (!text) return {};

  const fenMatch = /FEN:\s*([^\n\r]+)/i.exec(text);
  const stipMatch = /Stipulation:\s*([^\n\r]+)/i.exec(text);

  const fen = fenMatch ? fenMatch[1].trim() : undefined;
  const stip = stipMatch ? stipMatch[1].trim() : undefined;

  return { fen, stipulation: stip, raw: text };
}

// No default export — `parsePopeye` is a named export
