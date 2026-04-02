---
description: "Progetta e abbozza l'implementazione del solver Rust per directmate single-thread, con trait Stipulation, DFS e validazione delle linee di soluzione."
---

# Milestone 4: Directmate Solver Single-Thread

## Contesto

Una volta disponibili core ortodosso e input Popeye minimo, la prima stipolazione da implementare in modo completo e' il `directmate`.

## Obiettivo

Definisci l'architettura del solver single-thread per problemi `mate in n`, con responsabilita' chiare tra motore di ricerca e semantica della stipolazione.

Questa milestone deve vivere in una branch dedicata. Includi anche il perimetro Git della milestone, cioe' cosa deve entrare in questa branch e cosa deve restare fuori.

## Output richiesto

Fornisci:

1. design del trait `Stipulation` o equivalente;
2. implementazione concettuale di `DirectMate`;
3. struttura di `Solver`, `SearchContext`, `SearchNode`, `SearchOutcome`, `SolutionLine` o equivalenti;
4. algoritmo DFS ricorsivo single-thread;
5. criterio di successo, fallimento e pruning per directmate;
6. strategia di validazione delle linee e formattazione dei risultati.
7. nome consigliato della branch Git e modalita' di integrazione con le milestone precedenti.

## Vincoli

- La logica della stipolazione non deve essere dispersa nel motore di ricerca.
- Il design deve poter ospitare in seguito helpmate e selfmate.
- L'algoritmo base deve essere corretto e comprensibile prima di essere ottimizzato.

## Richieste specifiche

- Spiega la quantificazione esistenziale e universale nei nodi della ricerca.
- Mostra come identificare un mate finale valido.
- Indica dove integrare in futuro le condizioni fairy.
- Fornisci pseudocodice e firme Rust realistiche.

## Formato della risposta

- Modello concettuale del solver.
- Tipi e trait Rust.
- Pseudocodice DFS.
- Esempio di soluzione restituita.
