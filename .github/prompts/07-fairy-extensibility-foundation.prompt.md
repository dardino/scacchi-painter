---
description: "Definisci le fondamenta estensibili del solver Rust per fairy chess: registry dei pezzi, trait di comportamento, condizioni e punti di estensione del motore."
---

# Milestone 7: Fairy Extensibility Foundation

## Contesto

Il solver non deve nascere come sistema ortodosso chiuso. Questa milestone introduce l'infrastruttura di estensione per pezzi e condizioni fairy.

## Obiettivo

Progetta un modello plugin-friendly che permetta di aggiungere nuovi pezzi e nuove condizioni senza alterare in modo invasivo il core.

Assumi che questa milestone venga sviluppata in una branch dedicata e indica come isolare nella branch le modifiche strutturali necessarie all'estendibilita' fairy.

## Output richiesto

Fornisci:

1. modello di `PieceRole` per pezzi ortodossi e fairy;
2. trait `PieceBehaviour` o equivalente;
3. `FairyRegistry` o meccanismo analogo;
4. trait `Condition` e relativi hook;
5. punti del solver in cui i plugin intervengono;
6. strategia di parsing/serializzazione dei simboli fairy;
7. un esempio di pezzo fairy e un esempio di condizione fairy.
8. nome consigliato della branch Git e criteri di integrazione con il core gia' esistente.

## Vincoli

- Il core ortodosso deve continuare a funzionare senza costi eccessivi.
- Le estensioni fairy non devono imporre branching caotico nel codice del motore.
- Le API devono essere abbastanza semplici da poter registrare componenti custom anche in test o CLI.

## Richieste specifiche

- Confronta trait object, enum e registri dinamici.
- Spiega come mantenere separati movimento del pezzo, legalita' globale e condizioni del problema.
- Indica come questa architettura si collega al parser Popeye.
- Mostra esempi Rust di registrazione di plugin.

## Formato della risposta

- Architettura estensibile.
- Tipi e trait Rust.
- Esempi concreti di registrazione.
- Strategia di adozione progressiva dopo l'MVP ortodosso.
