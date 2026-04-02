---
description: "Usa questo prompt per progettare un solver di problemi di scacchi in Rust compatibile con Popeye, estendibile al fairy chess, parallelo e integrabile in Tauri."
---

# Motore di soluzione di problemi di scacchi in Rust, compatibile con Popeye

## Contesto

Sto progettando un nuovo motore di soluzione di problemi di scacchi in Rust, concettualmente simile a Popeye, ma pensato per essere:

- integrabile in Tauri;
- modulare ed estendibile verso il fairy chess;
- predisposto a una ricerca parallela multicore;
- compatibile in input con la sintassi Popeye già usata dall'interfaccia esistente.

Il frontend attuale usa già il formato testuale di Popeye. Di conseguenza la nuova libreria Rust deve poter leggere quel formato in modo nativo, oppure tramite un parser compatibile che preservi la semantica necessaria al solver.

Ogni milestone deve essere sviluppata nella propria branch dedicata. Nella proposta considera esplicitamente anche una strategia di branch per milestone, con naming convention, confini delle modifiche e criteri per il merge verso il branch di integrazione principale.

## Obiettivo della risposta

Voglio una proposta tecnica concreta per progettare, strutturare e avviare l'implementazione di questo motore. La risposta deve aiutarmi a prendere decisioni architetturali solide e a iniziare a scrivere codice, non solo a raccogliere idee generiche.

## Requisiti obbligatori

### 1. Architettura Rust a crate

Proponi una suddivisione in crate Rust, con responsabilità chiare, API pubbliche e dipendenze ben motivate. Come base, considera almeno:

- `chess-core`: rappresentazione della posizione, mosse, board state, regole ortodosse, verifica dello scacco, make/unmake o clone efficiente;
- `problem-solver`: stipolazioni, ricerca, generazione delle varianti, gestione delle condizioni, validazione delle soluzioni;
- `problem-io`: parser e AST del formato Popeye, FEN e conversioni da input testuale a modello interno;
- `solver-cli`: strumento da riga di comando per test, benchmark, profiling e debugging del solver.

Se ritieni utile introdurre crate aggiuntivi, proponili, ma giustifica il valore reale della separazione.

### 2. Compatibilità con il formato Popeye

Questo punto e' vincolante.

La libreria deve usare come input un formato compatibile con Popeye, perche' l'interfaccia corrente gia' genera e consuma quella sintassi. Voglio quindi una proposta che includa:

- parser del testo stile Popeye;
- AST intermedia esplicita;
- conversione AST -> modello interno del solver;
- strategia per mantenere compatibilita' progressiva anche se non tutto Popeye viene implementato subito;
- gestione chiara di direttive non ancora supportate, con errori strutturati o capability flags.

Se utile, distingui tra:

- compatibilita' sintattica completa;
- compatibilita' semantica parziale nella prima fase;
- roadmap per arrivare a una copertura piu' ampia.

### 3. Supporto fairy chess estendibile

Il design deve nascere estendibile, non essere solo ortodosso con patch successive.

Proponi un modello in cui siano presenti:

- `PieceRole` o equivalente, capace di rappresentare pezzi ortodossi e fairy;
- `PieceBehaviour` come trait o pattern equivalente per descrivere il movimento;
- `FairyRegistry` o meccanismo equivalente per registrare nuovi pezzi senza modificare il core;
- `Condition` come trait/plugin con hook sui momenti rilevanti della ricerca.

Spiega in quali punti i plugin fairy possono intervenire, per esempio:

- generazione mosse;
- legalita' delle mosse;
- applicazione della mossa;
- valutazione del nodo;
- verifica della stipolazione;
- serializzazione o parsing dei simboli dei pezzi.

### 4. Stipolazioni

Voglio un modello in cui ogni stipolazione sia isolata e componibile. Parti da:

- directmate come prima implementazione completa;
- estensione successiva verso helpmate, selfmate e altre stipolazioni.

Proponi un trait `Stipulation` o un design equivalente, chiarendo:

- quale e' il contratto tra ricerca e stipolazione;
- come cambia il criterio di successo o fallimento;
- come gestire il lato al tratto, la quantificazione esistenziale/universale e la validazione delle linee;
- come evitare che la logica della stipolazione si disperda nel motore di ricerca.

### 5. Ricerca e parallelizzazione

Voglio un design che parta semplice ma sia pronto a scalare.

Richiedo:

- una DFS ricorsiva single-thread come baseline;
- parallelizzazione delle mosse radice, e facoltativamente dei primi ply;
- uso di `rayon` oppure thread pool custom, con spiegazione del tradeoff;
- dati condivisi solo in lettura quando possibile (`Arc`, tabelle immutable, registry condivisi);
- raccolta thread-safe dei risultati;
- attenzione alla determinismo dell'output, o spiegazione di come gestire modalita' deterministica vs modalita' massimamente parallela.

Voglio anche indicazioni pratiche su:

- cancellazione anticipata;
- cut-off quando una stipolazione e' gia' soddisfatta;
- ordinamento mosse;
- transposition table, se utile, e suoi limiti nel problem chess rispetto al chess engine classico.

### 6. Integrazione con Tauri

Il motore deve essere integrabile in una app Tauri. Proponi:

- API Rust lato libreria;
- eventuale facade per il frontend;
- comandi Tauri idiomatici;
- modello di request/response serializzabile;
- gestione di job lunghi, progress, cancellation e streaming dei risultati.

Se opportuno, suggerisci come separare:

- core puro senza dipendenze UI;
- adapter Tauri;
- eventuale CLI che riusa lo stesso motore.

## Cosa voglio in output

La risposta deve essere strutturata e concreta. In particolare voglio:

### 1. Proposta architetturale

- struttura delle crate;
- dipendenze tra crate;
- responsabilita' di ciascun modulo;
- pattern architetturali consigliati.

### 2. Modello dati e API Rust

Fornisci tipi e trait Rust proposti, con firme plausibili. Per esempio:

- `Position`, `Board`, `Move`, `MoveEffect`, `Piece`, `PieceRole`;
- `Condition`, `PieceBehaviour`, `Stipulation`, `Solver`, `SearchContext`, `SearchResult`;
- `PopeyeAst`, `ProblemDefinition`, `ParsedDirective`, `UnsupportedFeature`.

Non limitarti ai nomi: mostra relazioni, ownership, lifetime dove serve, e motivazioni del design.

### 3. Esempi di codice

Includi esempi di codice Rust per:

- trait principali;
- registrazione di un pezzo fairy;
- registrazione di una condizione fairy;
- implementazione iniziale di `DirectMate`;
- scheletro del parser Popeye -> AST -> modello interno;
- esecuzione single-thread e parallel root search.

Il codice puo' essere parziale, ma deve essere coerente e abbastanza concreto da diventare base di implementazione.

### 4. Strategia di ricerca

Descrivi l'algoritmo di ricerca in modo operativo:

- schema DFS;
- come si delega la semantica alla stipolazione;
- dove entrano le condizioni fairy;
- come si costruiscono e si validano le varianti;
- come si parallelizza senza contaminare il core.

Se utile, usa pseudocodice o diagrammi logici testuali.

### 5. Strategia di compatibilita' Popeye

Spiega come introdurre gradualmente il supporto al formato Popeye senza bloccare l'implementazione del solver. Voglio una strategia del tipo:

- fase 1: subset supportato;
- fase 2: ampliamento della copertura;
- fase 3: supporto a fairy e condizioni piu' ricche.

### 6. Roadmap implementativa

Proponi una roadmap concreta a milestone, per esempio:

1. core ortodosso + modello posizione;
2. parser Popeye subset minimo;
3. directmate single-thread;
4. integrazione CLI;
5. parallelizzazione root;
6. primi pezzi fairy;
7. prime condizioni fairy;
8. adapter Tauri.

Per ogni milestone, indica deliverable, rischi e criteri di completamento.
Per ogni milestone, indica anche il nome consigliato della branch Git dedicata e il perimetro atteso delle modifiche in quella branch.

### 7. Tradeoff e rischi

Evidenzia chiaramente i tradeoff principali, per esempio:

- trait object vs enum/dispatch statico;
- board cloning vs make/unmake;
- registri dinamici vs tabelle compile-time;
- parser permissivo vs parser rigoroso;
- parallelismo aggressivo vs output deterministico.

## Vincoli di stile della risposta

- Non restare sul vago.
- Non limitarti a descrizioni teoriche: proponi API e strutture dati concrete.
- Se proponi pattern avanzati, spiega perche' sono davvero utili qui.
- Se una scelta complica troppo la prima versione, proponi una versione iniziale semplice e una successiva evoluzione.
- Mantieni una chiara distinzione tra MVP e architettura di lungo periodo.
- Privilegia modularita', estendibilita' e integrabilita' reale con Tauri.

## Aspettative finali

Voglio una risposta che possa fungere da base per:

- definire la struttura del workspace Rust;
- iniziare l'implementazione del parser compatibile con Popeye;
- creare il primo solver `directmate` funzionante;
- predisporre l'estensione futura a fairy chess, condizioni e parallelismo avanzato.
