---
description: "Progetta la parallelizzazione della ricerca nel solver Rust: root split, raccolta risultati, determinismo, cancellazione e benchmarking."
---

# Milestone 6: Parallel Root Search

## Contesto

Il solver deve sfruttare il multicore, ma senza contaminare il core con concorrenza non necessaria. La baseline esiste gia' in forma single-thread.

## Obiettivo

Definisci come parallelizzare la ricerca in modo pragmatico, partendo dalle mosse radice e mantenendo correttezza, osservabilita' e possibilita' di debugging.

Questa milestone deve essere sviluppata in una branch dedicata. Includi la proposta di naming Git e i limiti di scope per evitare di mischiare refactor non necessari.

## Output richiesto

Fornisci:

1. architettura della parallelizzazione;
2. confronto `rayon` vs thread pool custom;
3. modello dati condivisi e risultati;
4. strategia di cancellazione anticipata;
5. politica di ordinamento e merge dei risultati;
6. modalita' deterministica opzionale;
7. piano di benchmark e misurazione del beneficio.
8. nome consigliato della branch Git e strategia di merge dopo validazione prestazionale e di correttezza.

## Vincoli

- Il core single-thread deve restare il riferimento semantico.
- La parallelizzazione iniziale deve avvenire almeno a livello root.
- I risultati devono essere riproducibili oppure deve esistere una modalita' esplicitamente deterministica.

## Richieste specifiche

- Proponi tipi per `CancellationToken`, `SharedSearchState`, `RootTaskResult` o equivalenti.
- Descrivi il ciclo di vita di un job parallelo.
- Spiega dove ha senso fermarsi nella profondita' di split dei nodi.
- Commenta il ruolo eventuale di transposition table e i suoi limiti nel problem chess.

## Formato della risposta

- Architettura concorrente.
- API Rust e flussi principali.
- Pseudocodice del root split.
- Criteri di benchmark e rischi principali.
