---
description: "Progetta il workspace Rust del nuovo solver: crate boundaries, dipendenze, API pubbliche iniziali, convenzioni architetturali e piano di bootstrap del progetto."
---

# Milestone 1: Rust Solver Workspace & Architecture

## Contesto

Sto introducendo in questo repository un nuovo motore Rust per la soluzione di problemi di scacchi, compatibile in input con Popeye, estendibile al fairy chess e integrabile in Tauri.

Il repository contiene gia' una app Tauri in `Gui/sp-gui` e un frontend Angular che oggi usa la sintassi testuale di Popeye.

## Obiettivo

Proponi la struttura iniziale del workspace Rust e la sua architettura modulare, in modo che il progetto sia pronto a ospitare:

- core ortodosso;
- parser Popeye;
- solver di stipolazioni;
- estensioni fairy;
- integrazione Tauri;
- CLI per test e benchmark.

Questa milestone deve essere sviluppata in una branch dedicata. Considera quindi anche il perimetro della branch, le modifiche che devono restare confinate a questa fase e un naming Git consigliato.

## Output richiesto

Fornisci una proposta concreta che includa:

1. struttura del workspace Cargo;
2. crate da creare subito e crate opzionali futuri;
3. dipendenze tra crate;
4. responsabilita' di ciascun crate;
5. moduli interni consigliati;
6. convenzioni per error handling, logging, feature flags e test;
7. API pubbliche minime da stabilizzare nella prima milestone;
8. sequenza di bootstrap dei file e cartelle.
9. nome consigliato della branch Git per questa milestone e policy di merge.

## Vincoli

- Il design deve favorire riuso tra libreria, CLI e Tauri.
- Il core non deve dipendere da Tauri.
- La compatibilita' con Popeye va prevista fin dall'architettura.
- La futura estensione fairy non deve richiedere refactoring distruttivi del core.

## Richieste specifiche

- Proponi nomi di crate, path plausibili e primi `Cargo.toml`.
- Indica se usare crate separati per `domain`, `search`, `io`, `integration`, `bench`.
- Spiega i tradeoff di una separazione piu' fine vs piu' pragmatica.
- Distingui chiaramente MVP e architettura di lungo periodo.

## Formato della risposta

- Parti da una vista ad alto livello del workspace.
- Poi entra nel dettaglio crate per crate.
- Includi esempi di API Rust essenziali.
- Concludi con una checklist di bootstrap implementativo.
