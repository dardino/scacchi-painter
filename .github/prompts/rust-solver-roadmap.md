---
description: "Roadmap operativa del solver Rust: milestone, ordine di esecuzione, dipendenze, branch dedicate, deliverable, rischi e criteri di completamento."
---

# Rust Solver Roadmap

## Obiettivo

Questa roadmap definisce il percorso di sviluppo del nuovo solver di problemi di scacchi in Rust, compatibile con Popeye, estendibile al fairy chess, predisposto al parallelismo e integrabile nella app Tauri del repository.

## Principi di esecuzione

- Ogni milestone vive nella propria branch dedicata.
- Ogni milestone produce un outcome verificabile e integrabile.
- Ogni milestone ha scope limitato: niente lavoro di milestone successive nella stessa branch.
- Il branch di integrazione e' `refactoring`.
- Il merge verso `master` avviene solo dopo consolidamento su `refactoring`.

## Branch Strategy

- Branch di integrazione: `refactoring`
- Branch di milestone: `milestone/NN-slug-breve`
- Base branch per ogni milestone: `refactoring`
- Target delle PR di milestone: `refactoring`

## Vista sintetica

| Milestone | Branch | Focus | Dipende da | Stato atteso |
| --- | --- | --- | --- | --- |
| 01 | `milestone/01-workspace-architecture` | Workspace Rust e architettura | nessuna | struttura pronta allo sviluppo |
| 02 | `milestone/02-orthodox-core` | Core ortodosso MVP | 01 | generazione mosse e legalita' base |
| 03 | `milestone/03-popeye-input` | Parser e AST Popeye | 01 | input compatibile minimo |
| 04 | `milestone/04-directmate-single-thread` | Solver directmate single-thread | 02, 03 | primo solver funzionante |
| 05 | `milestone/05-cli-test-debug` | CLI, regressione, debug | 04 | sviluppo e verifica ripetibili |
| 06 | `milestone/06-parallel-root-search` | Parallelismo root search | 04, 05 | solver multicore controllato |
| 07 | `milestone/07-fairy-foundation` | Estendibilita' fairy | 02, 03, 04 | plugin model per pezzi e condizioni |
| 08 | `milestone/08-tauri-adapter` | Integrazione Tauri | 04, 05, 06 | adapter frontend-backend completo |

## Sequenza raccomandata

1. Milestone 01
2. Milestone 02
3. Milestone 03
4. Milestone 04
5. Milestone 05
6. Milestone 06
7. Milestone 07
8. Milestone 08

Nota:
La milestone 07 puo' partire anche in parallelo a fine milestone 05, ma conviene chiudere prima 04 per avere un core e una semantica solver gia' stabili.

## Milestone 01: Rust Solver Workspace & Architecture

Branch: `milestone/01-workspace-architecture`

Obiettivo:
Impostare il workspace Rust, i crate iniziali, i confini architetturali e le convenzioni comuni che permettono di far evolvere il solver senza refactor distruttivi.

Deliverable:

- workspace Cargo configurato;
- crate iniziali creati;
- responsabilita' dei crate documentate;
- API pubbliche minime identificate;
- error model e convenzioni test/logging impostati.

Fuori scope:

- solver completo;
- parser Popeye completo;
- integrazione Tauri funzionante.

Rischi principali:

- separazione dei crate troppo fine e costosa da mantenere;
- separazione troppo debole che accoppia core, parser e UI.

Criteri di completamento:

- il workspace compila;
- i crate iniziali sono coerenti con i confini architetturali scelti;
- il piano delle dipendenze tra crate e' stabile per le milestone successive.

PR title:
`[Milestone 01] Bootstrap Rust solver workspace architecture`

## Milestone 02: Orthodox Chess Core MVP

Branch: `milestone/02-orthodox-core`

Obiettivo:
Implementare il core ortodosso minimo del solver: posizione, board, mosse, legalita', scacco, mate e stato del gioco.

Deliverable:

- tipi base per board e position;
- generazione mosse pseudo-legali e legali;
- rilevazione dello scacco;
- applicazione e rollback delle mosse;
- test unitari sulle regole ortodosse principali.

Fuori scope:

- fairy pieces reali;
- parallelismo;
- integrazione Tauri;
- copertura completa di tutte le direttive Popeye.

Rischi principali:

- rappresentazione interna troppo ottimizzata troppo presto;
- make/unmake fragile e difficile da verificare;
- punti di estensione fairy non previsti nel modello.

Criteri di completamento:

- il core genera mosse legali corrette;
- check, mate e stalemate sono verificabili;
- i test del dominio ortodosso coprono i casi base e i casi limite principali.

PR title:
`[Milestone 02] Implement orthodox chess core MVP`

## Milestone 03: Popeye-Compatible Input MVP

Branch: `milestone/03-popeye-input`

Obiettivo:
Introdurre il parser compatibile con Popeye, l'AST intermedia e il mapping dal testo al modello interno.

Deliverable:

- lexer/parser o pipeline equivalente;
- AST esplicita del problema;
- diagnostica strutturata;
- mapping verso `ProblemDefinition` o equivalente;
- subset Popeye sufficiente a sbloccare i primi problemi ortodossi directmate.

Fuori scope:

- copertura totale di Popeye;
- supporto esteso a condizioni fairy complesse;
- formattazione finale completa di tutte le varianti di output.

Rischi principali:

- parser troppo permissivo e ambiguo;
- parser troppo rigido rispetto ai casi reali gia' emessi dall'interfaccia;
- mancata separazione tra parsing sintattico e validazione semantica.

Criteri di completamento:

- almeno un subset documentato del formato Popeye e' supportato end-to-end;
- gli elementi non supportati sono segnalati in modo esplicito;
- il mapper genera strutture riusabili dal solver.

PR title:
`[Milestone 03] Add Popeye-compatible input MVP`

## Milestone 04: Directmate Solver Single-Thread

Branch: `milestone/04-directmate-single-thread`

Obiettivo:
Implementare il primo solver funzionante per problemi `mate in n` con ricerca DFS single-thread.

Deliverable:

- trait `Stipulation` o design equivalente;
- implementazione `DirectMate`;
- ricerca DFS single-thread;
- struttura dei risultati di soluzione;
- validazione delle linee di soluzione.

Fuori scope:

- parallelizzazione;
- helpmate, selfmate e stipolazioni aggiuntive;
- supporto fairy pienamente funzionante.

Rischi principali:

- semantica della stipolazione dispersa nel search engine;
- scarsa separazione tra dominio e ricerca;
- pruning prematuro che compromette correttezza o spiegabilita'.

Criteri di completamento:

- un problema ortodosso `mate in n` puo' essere caricato da input Popeye e risolto;
- il solver produce risultati strutturati e verificabili;
- il comportamento della DFS e' sufficientemente stabile per diventare baseline.

PR title:
`[Milestone 04] Add single-thread directmate solver`

## Milestone 05: CLI, Test Corpus & Debug Tooling

Branch: `milestone/05-cli-test-debug`

Obiettivo:
Dotare il solver di una CLI di sviluppo e di un'infrastruttura di regressione, test e benchmark.

Deliverable:

- comando CLI per parsing e solving;
- corpus di test versionato;
- output diagnostici e dump utili al debugging;
- benchmark ripetibili;
- base per regressione automatica.

Fuori scope:

- nuove capacità semantiche del solver non strettamente necessarie al tooling;
- integrazione UI.

Rischi principali:

- accoppiare troppo la CLI al core;
- corpus non rappresentativo;
- benchmark non confrontabili tra esecuzioni.

Criteri di completamento:

- esiste un entry point CLI riusabile in sviluppo e CI;
- esiste un corpus minimo di problemi noti;
- i risultati del solver sono confrontabili e regressibili.

PR title:
`[Milestone 05] Add solver CLI, regression corpus and debug tooling`

## Milestone 06: Parallel Root Search

Branch: `milestone/06-parallel-root-search`

Obiettivo:
Parallelizzare la ricerca sulle mosse radice mantenendo correttezza, osservabilita' e possibilita' di esecuzione deterministica.

Deliverable:

- root split parallelo;
- gestione stato condiviso in sola lettura;
- raccolta thread-safe dei risultati;
- cancellation di base;
- benchmark comparativi single-thread vs parallel.

Fuori scope:

- parallelizzazione arbitraria a ogni profondita';
- ottimizzazioni premature difficili da verificare;
- redesign completo del solver per il multithreading.

Rischi principali:

- output non deterministico non controllato;
- cancellazione difficile da propagare;
- overhead parallelo maggiore del beneficio su problemi piccoli.

Criteri di completamento:

- il solver produce risultati corretti anche in modalita' parallela;
- esiste una strategia chiara per determinismo o merge ordinato;
- i benchmark mostrano comportamento comprensibile e misurabile.

PR title:
`[Milestone 06] Parallelize solver root search`

## Milestone 07: Fairy Extensibility Foundation

Branch: `milestone/07-fairy-foundation`

Obiettivo:
Introdurre i punti di estensione necessari per pezzi fairy e condizioni fairy senza compromettere il core ortodosso.

Deliverable:

- modello `PieceRole` estendibile;
- trait `PieceBehaviour` o equivalente;
- registry dei pezzi fairy;
- trait `Condition` e hook nel motore;
- almeno un esempio di pezzo fairy e una condizione fairy.

Fuori scope:

- ampia copertura del fairy chess;
- supporto esteso a decine di condizioni;
- compatibilita' completa con tutte le varianti Popeye relative al fairy.

Rischi principali:

- plugin model troppo complesso;
- costi di dispatch eccessivi in punti troppo caldi;
- logica fairy mescolata al core ortodosso.

Criteri di completamento:

- il core ortodosso continua a funzionare senza regressioni;
- esiste un modello pratico per registrare nuove estensioni;
- i primi esempi fairy dimostrano che l'architettura regge.

PR title:
`[Milestone 07] Add fairy extensibility foundation`

## Milestone 08: Tauri Integration Adapter

Branch: `milestone/08-tauri-adapter`

Obiettivo:
Integrare il solver Rust nella app Tauri con API serializzabili, gestione job, progress e cancellation.

Deliverable:

- facade Rust sopra il solver;
- DTO request/response;
- comandi Tauri;
- progress reporting;
- cancellation di job lunghi;
- integrazione con il frontend esistente.

Fuori scope:

- redesign del frontend Angular;
- supporto UI completo a tutte le future capacita' fairy;
- ottimizzazioni UX non necessarie all'integrazione del motore.

Rischi principali:

- accoppiamento tra Tauri e core solver;
- gestione concorrente dei job poco robusta;
- progress reporting troppo invasivo sul motore.

Criteri di completamento:

- il frontend puo' inviare un input Popeye al solver Rust;
- il backend Tauri restituisce esiti, errori e progress coerenti;
- un job lungo puo' essere annullato in modo controllato.

PR title:
`[Milestone 08] Integrate Rust solver with Tauri adapter`

## Dipendenze e note di pianificazione

- 01 e' prerequisito strutturale per tutto il resto.
- 02 e 03 possono essere sviluppate in parallelo solo se i contratti del dominio vengono chiusi prima.
- 04 dipende in modo forte sia da 02 sia da 03.
- 05 si appoggia a 04 per avere un solver realmente esercitabile.
- 06 ha senso solo dopo che 04 e 05 hanno reso il comportamento misurabile.
- 07 richiede almeno una base stabile di 02, 03 e 04.
- 08 conviene affrontarla dopo 04 e 05, idealmente con 06 gia' disponibile se si vogliono gestire job pesanti.

## Definition of Done complessiva

La roadmap puo' considerarsi completata quando:

- esiste un solver Rust integrato nel repository;
- il solver accetta input compatibile con Popeye almeno per il subset MVP;
- `directmate` ortodosso funziona end-to-end;
- esiste tooling CLI per sviluppo e regressione;
- esiste parallelizzazione iniziale utile e verificabile;
- il disegno architetturale consente estensioni fairy reali;
- il solver e' integrato nella app Tauri tramite adapter dedicato.

## Riferimenti

- `rust-engine-like-popeye.md`
- `rust-solver-milestones-index.md`
- `01-rust-solver-workspace-architecture.prompt.md`
- `02-orthodox-chess-core-mvp.prompt.md`
- `03-popeye-input-mvp.prompt.md`
- `04-directmate-single-thread.prompt.md`
- `05-cli-test-corpus-debugging.prompt.md`
- `06-parallel-root-search.prompt.md`
- `07-fairy-extensibility-foundation.prompt.md`
- `08-tauri-integration-adapter.prompt.md`
