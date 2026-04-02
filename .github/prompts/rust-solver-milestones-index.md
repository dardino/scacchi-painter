---
description: "Indice operativo delle milestone del solver Rust: branch map completa, prompt associati e titoli/descrizioni suggeriti per branch e pull request."
---

# Rust Solver Milestones Index

## Scopo

Questo file raccoglie in un unico punto:

- la branch map completa per lo sviluppo del solver Rust;
- il prompt associato a ogni milestone;
- il titolo consigliato della branch;
- la descrizione sintetica della branch;
- il titolo consigliato della pull request;
- la descrizione sintetica della pull request.

## Regola di processo

Ogni milestone deve essere sviluppata nella propria branch dedicata.

Strategia consigliata:

- branch di integrazione: `refactoring`
- branch di lavoro: una branch per milestone, creata da `refactoring`
- merge target delle PR di milestone: `refactoring`
- merge verso `master`: solo dopo integrazione e validazione complessiva

## Naming convention

Formato consigliato delle branch:

`milestone/NN-slug-breve`

Dove:

- `NN` e' il numero della milestone a due cifre;
- `slug-breve` descrive il risultato principale della milestone;
- una branch di milestone non deve contenere lavoro appartenente a milestone successive.

Formato consigliato dei titoli PR:

`[Milestone NN] Titolo breve orientato all'outcome`

## Branch Map

| Milestone | Branch | Base | Target PR | Prompt | Outcome principale |
| --- | --- | --- | --- | --- | --- |
| 01 | `milestone/01-workspace-architecture` | `refactoring` | `refactoring` | `01-rust-solver-workspace-architecture.prompt.md` | Workspace Rust, crate boundaries, bootstrap architetturale |
| 02 | `milestone/02-orthodox-core` | `refactoring` | `refactoring` | `02-orthodox-chess-core-mvp.prompt.md` | Core ortodosso MVP: board, position, move generation |
| 03 | `milestone/03-popeye-input` | `refactoring` | `refactoring` | `03-popeye-input-mvp.prompt.md` | Parser Popeye, AST, diagnostica, mapping semantico |
| 04 | `milestone/04-directmate-single-thread` | `refactoring` | `refactoring` | `04-directmate-single-thread.prompt.md` | Solver directmate single-thread |
| 05 | `milestone/05-cli-test-debug` | `refactoring` | `refactoring` | `05-cli-test-corpus-debugging.prompt.md` | CLI, corpus di test, debugging e benchmark |
| 06 | `milestone/06-parallel-root-search` | `refactoring` | `refactoring` | `06-parallel-root-search.prompt.md` | Parallelizzazione delle mosse radice |
| 07 | `milestone/07-fairy-foundation` | `refactoring` | `refactoring` | `07-fairy-extensibility-foundation.prompt.md` | Fondamenta estensibili per fairy pieces e conditions |
| 08 | `milestone/08-tauri-adapter` | `refactoring` | `refactoring` | `08-tauri-integration-adapter.prompt.md` | Adapter Tauri e job API verso il frontend |

## Branch e PR Catalogo

### Milestone 01

Branch name: `milestone/01-workspace-architecture`

Branch description:
Imposta il workspace Rust del solver, i crate iniziali, i confini architetturali, le convenzioni comuni e il bootstrap minimo necessario a sostenere le milestone successive.

PR title:
`[Milestone 01] Bootstrap Rust solver workspace architecture`

PR description:
Introduce il workspace Rust del nuovo solver con crate iniziali, responsabilita' modulari, convenzioni condivise e struttura pronta per parser Popeye, core ortodosso, solver e integrazione futura con Tauri.

### Milestone 02

Branch name: `milestone/02-orthodox-core`

Branch description:
Implementa il core ortodosso MVP del solver Rust: rappresentazione della posizione, mosse, legalita', rilevazione dello scacco e strategia make/unmake o equivalente.

PR title:
`[Milestone 02] Implement orthodox chess core MVP`

PR description:
Introduce il nucleo ortodosso del solver con tipi base per board e position, generazione mosse, controlli di legalita' e test unitari per rendere possibile lo sviluppo del solver di stipolazioni.

### Milestone 03

Branch name: `milestone/03-popeye-input`

Branch description:
Introduce il layer di input compatibile con Popeye, con parsing del testo, AST intermedia, diagnostica strutturata e conversione verso il modello interno del solver.

PR title:
`[Milestone 03] Add Popeye-compatible input MVP`

PR description:
Implementa il primo supporto al formato Popeye tramite lexer/parser, AST e mapping semantico verso il dominio interno, con gestione esplicita di errori, warning e feature non ancora supportate.

### Milestone 04

Branch name: `milestone/04-directmate-single-thread`

Branch description:
Costruisce la prima stipolazione completa del solver, `directmate`, con ricerca DFS single-thread, modellazione della semantica della stipolazione e validazione delle linee di soluzione.

PR title:
`[Milestone 04] Add single-thread directmate solver`

PR description:
Introduce il solver single-thread per problemi mate in n, separando responsabilita' tra motore di ricerca e stipolazione, con struttura dei risultati e validazione delle soluzioni generate.

### Milestone 05

Branch name: `milestone/05-cli-test-debug`

Branch description:
Espone il solver tramite CLI e aggiunge strumenti per regressione, corpus di test, debug e benchmarking ripetibile durante lo sviluppo.

PR title:
`[Milestone 05] Add solver CLI, regression corpus and debug tooling`

PR description:
Introduce una CLI riusabile per parsing e solving, un corpus di test per regressione, strumenti di diagnostica e benchmark utili a stabilizzare il comportamento del motore.

### Milestone 06

Branch name: `milestone/06-parallel-root-search`

Branch description:
Parallelizza la ricerca a livello root, con raccolta risultati thread-safe, cancellazione anticipata, opzione deterministica e benchmarking delle prestazioni.

PR title:
`[Milestone 06] Parallelize solver root search`

PR description:
Estende il solver con parallelizzazione delle mosse radice, gestione dello stato condiviso in sola lettura, raccolta coordinata dei risultati e misurazione del guadagno prestazionale rispetto alla baseline single-thread.

### Milestone 07

Branch name: `milestone/07-fairy-foundation`

Branch description:
Introduce l'infrastruttura di estendibilita' per fairy chess, inclusi registry dei pezzi, trait di comportamento, condizioni e hook nel motore.

PR title:
`[Milestone 07] Add fairy extensibility foundation`

PR description:
Costruisce le fondamenta del supporto fairy attraverso ruoli dei pezzi estendibili, registry dinamici o equivalenti, condizioni plugin e primi esempi di estensione integrati nel solver.

### Milestone 08

Branch name: `milestone/08-tauri-adapter`

Branch description:
Integra il solver Rust nella app Tauri tramite facade dedicata, DTO serializzabili, comandi Tauri, progress reporting, streaming e cancellation dei job.

PR title:
`[Milestone 08] Integrate Rust solver with Tauri adapter`

PR description:
Espone il solver al frontend Tauri con un adapter dedicato, request/response serializzabili e gestione di job lunghi, in modo da integrare parsing, solving, progress e cancellazione nell'app esistente.

## Checklist per ogni PR di milestone

- La branch contiene solo lavoro appartenente alla milestone corrente.
- Il prompt associato alla milestone e' stato usato come riferimento principale.
- Le dipendenze verso milestone precedenti sono esplicite e minimali.
- Test e verifiche della milestone sono inclusi o documentati.
- La PR dichiara chiaramente cosa resta fuori scope per la milestone successiva.

## Riferimenti ai prompt

- `01-rust-solver-workspace-architecture.prompt.md`
- `02-orthodox-chess-core-mvp.prompt.md`
- `03-popeye-input-mvp.prompt.md`
- `04-directmate-single-thread.prompt.md`
- `05-cli-test-corpus-debugging.prompt.md`
- `06-parallel-root-search.prompt.md`
- `07-fairy-extensibility-foundation.prompt.md`
- `08-tauri-integration-adapter.prompt.md`
