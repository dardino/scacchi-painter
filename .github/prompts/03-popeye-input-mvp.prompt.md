---
description: "Progetta il parser Rust compatibile con Popeye: lexer, AST, diagnostica, mapping verso il modello interno e strategia di compatibilita' progressiva."
---

# Milestone 3: Popeye-Compatible Input MVP

## Contesto

L'interfaccia corrente usa la sintassi Popeye come formato di input dei problemi. Il nuovo solver Rust deve quindi essere compatibile con quel formato almeno per un subset utile, con una strategia chiara di copertura progressiva.

## Obiettivo

Progetta il livello di input della libreria Rust, dal testo Popeye al modello interno del solver.

Assumi che questa milestone venga sviluppata in una branch dedicata separata dalle altre e includi una proposta di naming e di confine delle modifiche.

## Output richiesto

Fornisci una proposta concreta che includa:

1. strategia di parsing del testo Popeye;
2. lexer e parser, oppure parser combinator, con motivazione della scelta;
3. AST esplicita per il problema;
4. modello di diagnostica e gestione degli elementi non supportati;
5. conversione AST -> `ProblemDefinition` o equivalente;
6. subset MVP da supportare subito;
7. piano di estensione per direttive, pezzi fairy e condizioni future.
8. nome consigliato della branch Git di milestone e criteri di merge.

## Vincoli

- La compatibilita' sintattica con Popeye e' un requisito forte.
- La compatibilita' semantica puo' essere incrementale, ma deve essere dichiarata esplicitamente.
- Le direttive non supportate non devono fallire in modo opaco.
- L'API deve permettere al frontend o alla CLI di distinguere errori, warning e feature non supportate.

## Richieste specifiche

- Proponi i tipi Rust per `PopeyeAst`, `Directive`, `ProblemDefinition`, `ParseDiagnostic`, `UnsupportedFeature`.
- Mostra un esempio di input Popeye e come viene rappresentato nell'AST.
- Suggerisci come mantenere separati parser, validazione e mapping semantico.
- Indica cosa supportare nella fase 1 per sbloccare `directmate` ortodosso.

## Formato della risposta

- Pipeline di parsing end-to-end.
- Tipi Rust e firme plausibili.
- Esempio concreto testo -> AST -> modello interno.
- Roadmap di compatibilita' in 3 fasi.
