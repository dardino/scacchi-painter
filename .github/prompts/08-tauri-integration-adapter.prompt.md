---
description: "Progetta l'adapter Tauri del solver Rust: facade, command API, DTO serializzabili, gestione job lunghi, progress, streaming e cancellation."
---

# Milestone 8: Tauri Integration Adapter

## Contesto

Il solver Rust deve essere integrato nella app Tauri gia' presente nel repository, mantenendo separato il core dal livello UI e riusando la stessa logica gia' esposta via CLI.

## Obiettivo

Definisci come esporre il solver al frontend Tauri con API robuste, serializzabili e adatte a job potenzialmente lunghi.

Assumi che questa milestone venga sviluppata in una branch dedicata e proponi anche il naming Git e il perimetro delle modifiche accettabili in quella branch.

## Output richiesto

Fornisci:

1. architettura dell'adapter Tauri;
2. facade Rust riusabile sopra il solver;
3. DTO di request/response serializzabili;
4. comandi Tauri idiomatici;
5. strategia di progress reporting;
6. cancellation e gestione job concorrenti;
7. eventuale streaming incrementale dei risultati.
8. nome consigliato della branch Git e strategia di merge verso il branch di integrazione.

## Vincoli

- Il core solver non deve dipendere da Tauri.
- L'integrazione deve accettare input compatibile con Popeye.
- Deve essere possibile distinguere parsing, validazione, avvio solver, progress ed esito finale.
- Il design deve supportare sia chiamate sincrone semplici sia job lunghi gestiti per id.

## Richieste specifiche

- Proponi tipi come `SolveRequest`, `SolveResponse`, `SolveProgressEvent`, `JobId`, `CancelRequest` o equivalenti.
- Spiega come collegare cancellation e progress ai task Rust asincroni.
- Indica come armonizzare questa facade con CLI e libreria.
- Fornisci esempi di comando Tauri e flusso frontend-backend.

## Formato della risposta

- Vista architetturale.
- API Rust e DTO.
- Flusso dei job.
- Checklist di integrazione nel progetto Tauri esistente.
