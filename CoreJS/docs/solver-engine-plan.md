# Piano dettagliato: Motore di soluzioni (CoreJS)

Data: 2026-04-13

Obiettivo

- Progettare e implementare, in CoreJS, un "motore di soluzioni" (solver) che possa risolvere problemi Popeye (soprattutto stipulazioni tipo #N) e che sia utilizzabile per test automatici e benchmark.
- Il primo traguardo è un reference solver single-thread, corretto e testabile, che può poi essere ottimizzato (TT, parallelismo, heuristics) o sostituito/integrato con la versione Rust via WASM/child process se necessario.

Scope e vincoli

- Supporto iniziale: parsing minimale di Popeye/FEN + stipulazione (#N). Input: fixture JSON esistente (`CoreJS/test/fixtures/yacpdb-sample.json`).
- Output: struttura JSON con esito (solved/failed), linea di soluzione trovata (se presente), profondità, tempi, nodi visitati.
- Linguaggio: TypeScript (CoreJS). Toolchain: `pnpm`, `vitest`.

Deliverables

- File di piano (questo).
- Tipi/Schema TS: `ProblemInput`, `SolverResult`, `SolverOptions`.
- Implementazione refactorable in `CoreJS/src/solver/*` con moduli: parser, engine, search, transposition, runner.
- Script runner per eseguire la fixture (`CoreJS/scripts/run-solver-fixture.mjs`).
- Test d'integrazione che confrontano `yacpdb_solution` con output del solver.

Architettura ad alto livello

- Parser: estrae FEN, side-to-move, e stipulazione da snippet Popeye.
- Posizione: riusa le strutture bitboard/move-generator esistenti (CoreJS/src/*).
- Search engine: iterative deepening + negamax/alpha-beta con gestione speciale per "mate in N" (mate-distance scoring).
- Transposition Table (TT): cache valutazioni/linee; chiavi Zobrist (BigInt).
- Parallelizzazione: root-parallel workers che scansionano mosse di radice; design per webworker/node worker threads.
- Runner/CLI: carica fixture, invoca solver per ogni problema, serializza risultati, e confronta con `yacpdb_solution`.

Tipi e schema proposto (TS)

```ts
export type ProblemInput = {
  id: string;
  title?: string[];
  fen: string;
  popeye?: string; // testo originale
  stipulation?: string; // e.g. "#2"
  yacpdb_solution?: string;
}

export type SolverResult = {
  id: string;
  solved: boolean;
  depthSearched: number;
  timeMs: number;
  nodes: number;
  solutionLines?: string[]; // array di mosse in formato algebico o testo grezzo
  error?: string;
}

export type SolverOptions = {
  maxDepth?: number;
  timeLimitMs?: number;
  threads?: number;
}
```

Interfacce file-level previste

- `CoreJS/src/solver/index.ts` — entrypoint, esporta `solve(problem, opts)`.
- `CoreJS/src/solver/parse.ts` — parser Popeye/FEN -> `ProblemInput`.
- `CoreJS/src/solver/engine.ts` — wrapper e orchestrator (iterative deepening, time limit).
- `CoreJS/src/solver/search.ts` — core search (negamax/alpha-beta, mate-distance handling).
- `CoreJS/src/solver/tt.ts` — transposition table.
- `CoreJS/src/solver/workerPool.ts` — (futuro) parallel runner.

Algoritmo di ricerca (linee guida)

- Ricerca base: iterative deepening (IDDFS) con negamax + alpha-beta.
- Mate handling: usare valori speciali (e.g. +INF - ply) per rappresentare mate in N; la checkmate detection deve essere fatta nella generazione o nella funzione di terminale.
- Ordinamento mosse: catture prima, move ordering semplice con killer/history (step 2: miglioramento con SEE o MVV/LVA).
- Playout limit: per problemi #N, limiti di profondità netti corrispondenti a 2*N plies (o policy definita nella stipulazione).

Trasposizione e Zobrist

- Generare chiavi Zobrist (BigInt) con costanti iniziali salvate in `CoreJS/src/solver/zobrist.ts`.
- TT entry contiene {key, depth, score, flag, bestMove}.

Parallelizzazione (proposta)

- Root-splitting: generare mosse di radice, distribuire ogni ramo principale a worker separati. Worker esegue search indipendente con TT locale o condivisa.
- Condivisione TT: implementare in seguito (con locking o sharding) se serve.

Integrazione con fixture YACPDB

- Runner (`CoreJS/scripts/run-solver-fixture.mjs`) legge `CoreJS/test/fixtures/yacpdb-sample.json`.
- Per ogni `ProblemInput`, invocare `solve(...)` con `maxDepth` ricavato da `stipulation` (es: `#2` -> depth=4 plies).
- Confronto: estrarre `solutionLines` e provare la membership della prima mossa proposta in `yacpdb_solution` oppure fare confronto testuale fuzzy.

Testing e criteri di accettazione

- Unit: parser, funzione di generazione mosse per casi limite, ricerca a depth=1/2 con posizioni note.
- Integration: eseguire il runner sulla fixture YACPDB e registrare almeno X problemi risolti correttamente (accettazione: il solver trova la stessa prima mossa o linea equivalente per problemi #1/#2 scelti come baseline).

Performance e ottimizzazione

- Metriche: nodes/s, tempo per problema, memoria TT.
- Ottimizzazioni successive: transposition table tuning, move ordering, bitboard micro-ottimizzazioni, asm-like loops in critical path.
- Fallback: se TS non raggiunge perf desiderata, integrare la versione Rust via child_process (usare `CoreRust/apps/solver-cli`), o compilare WASM dal Rust.

Milestones (con stime rapide)

1. (0.5d) Scrivere questo piano e tipi TS — (completato).
2. (1d) Implementare parser Popeye/FEN + test unitari.
3. (2-3d) Implementare engine single-thread ref (iterative deepening + negamax) + unit tests.
4. (1d) Integrare runner che esegue la fixture YACPDB e produce JSON di risultati.
5. (1-2d) Aggiungere TT + migliorare ordering; rieseguire fixture e misurare.
6. (2-3d) Implementare worker pool root-parallel; esporre opzione `threads`.
7. (1d) Scrivere benchmark e CI steps.

Rischi e mitigazioni

- Parser Popeye complesso: iniziare con parsing minimale (FEN + stipulazione). Estendere progressivamente.
- Performance TS: mitigare con profiling e, se necessario, usare Rust/WASM.

Prossimi passi immediati (azione consigliata)

1. Definire e creare i tipi TS (file `CoreJS/src/solver/types.ts`).
2. Implementare il parser minimale (file `CoreJS/src/solver/parse.ts`) e scrivere unit test che caricano la fixture.

---
File: `CoreJS/docs/solver-engine-plan.md` (questo file)
