---
description: "Definisci il core ortodosso del solver Rust: board representation, position, move generation, legalita', check detection e strategia make/unmake o cloning."
---

# Milestone 2: Orthodox Chess Core MVP

## Contesto

Sto implementando il nucleo ortodosso del solver Rust. Questa milestone deve fornire le primitive di base per rappresentare una posizione, generare mosse legali e applicare/revertire mosse in modo efficiente.

Il solver finale dovra' supportare fairy chess, ma in questa fase voglio un core ortodosso robusto e ben progettato, che non ostacoli l'estensione successiva.

## Obiettivo

Progetta e descrivi il core ortodosso minimo ma solido per il solver, con API Rust concrete e scelte implementative motivate.

Assumi che questa milestone venga sviluppata in una branch dedicata e indica con precisione quali cambiamenti devono rimanere confinati a questa branch prima del merge.

## Output richiesto

Fornisci:

1. modello dati per `Square`, `Piece`, `PieceColor`, `PieceRole`, `Board`, `Position`, `Move`, `MoveKind`, `Undo` o equivalenti;
2. scelta della rappresentazione interna, per esempio mailbox, bitboard, ibrida o altra soluzione pragmatica;
3. strategia per `make_move` e `unmake_move`, oppure clone efficiente del nodo;
4. algoritmo per generazione mosse pseudo-legali e filtro di legalita';
5. rilevazione di check, mate e stalemate;
6. suite minima di test unitari e invarianti da imporre al core.
7. nome consigliato della branch Git di milestone e strategia di integrazione.

## Vincoli

- Il design deve essere compatibile con una futura estensione fairy.
- Non introdurre dipendenze da parser o UI.
- Evita complessita' da engine competitivo se non danno valore al problem solving.
- Spiega quando scegliere semplicità rispetto a micro-ottimizzazioni premature.

## Richieste specifiche

- Confronta `make/unmake` vs clone strutturato per questo dominio.
- Indica i punti del design dove innestare in futuro comportamenti fairy.
- Proponi tipi Rust e firme di funzione realistiche.
- Includi un esempio di flusso: posizione iniziale -> generazione mosse -> applicazione -> undo.

## Formato della risposta

- Architettura dei tipi.
- API Rust suggerite.
- Pseudocodice dei passaggi critici.
- Piano di test e criteri di completamento della milestone.
