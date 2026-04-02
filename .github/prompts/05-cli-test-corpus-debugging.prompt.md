---
description: "Definisci la CLI del solver Rust, il corpus di test, la strategia di regressione e gli strumenti di debug e benchmark per il motore."
---

# Milestone 5: CLI, Test Corpus & Debug Tooling

## Contesto

Il solver Rust ha bisogno di un'interfaccia di linea di comando per sviluppo, profiling, regressione e debugging indipendente da Tauri.

## Obiettivo

Progetta la CLI e l'infrastruttura di test e diagnostica che permettano di sviluppare il solver in modo rapido e misurabile.

Assumi che questa milestone sia sviluppata in una branch dedicata e chiarisci come limitare la branch alle sole modifiche di tooling, test, corpus e diagnosi.

## Output richiesto

Fornisci:

1. design della CLI e dei comandi principali;
2. strategia di input/output per problemi Popeye;
3. formato di output per soluzioni, errori, warning e benchmark;
4. piano per corpus di test e regressione;
5. strumenti di tracing e debug del solver;
6. approccio a benchmark e profiling.
7. nome consigliato della branch Git e criteri per il merge senza introdurre cambi funzionali non previsti.

## Vincoli

- La CLI deve riusare il core e non duplicare logica.
- Deve essere utile sia per sviluppo locale sia per CI.
- Deve aiutare a confrontare comportamenti single-thread e parallel.

## Richieste specifiche

- Proponi comandi come `solve`, `parse`, `explain`, `bench`, `dump-ast` o equivalenti.
- Suggerisci struttura di cartelle per corpus di test e golden files.
- Indica come serializzare i risultati in testo e, se utile, JSON.
- Descrivi una strategia per regression testing su problemi noti.

## Formato della risposta

- UX della CLI.
- API e crate consigliati.
- Esempi di invocazione.
- Piano test/benchmark con criteri di chiusura della milestone.
