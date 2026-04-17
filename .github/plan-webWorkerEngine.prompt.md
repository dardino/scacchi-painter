## Plan: Motore Unificato via WebWorkers

TL;DR: Sostituire l'attuale biforcazione Node/browser dell'engine con un sistema unico basato su WebWorkers: estrarre il compute puro (`search`, generatori mosse), implementare adattatori worker per browser e Node (worker_threads), produrre bundle dedicati e mantenere fallback a child_process finché i test non passano.

**Steps**
1. **Definire il protocollo worker**: creare interfacce TypeScript per i messaggi (handshake per `SharedArrayBuffer` opzionale, `init`, `solve`, `progress`, `result`, `error`). *Deliverable*: `CoreJS/src/solver/worker-protocol.ts`.
2. **Estrarre il compute puro**: verificare/refactorare `search` e i generatori di mosse per rimuovere dipendenze runtime (I/O, process-specific). Esportare un modulo `CoreJS/src/worker/compute.ts` che ri-esporta `search`, `GeneratePseudoMoves`, `applyMove`.
3. **Implementare adattatori worker**:
   - **Browser worker**: `CoreJS/src/worker/worker-browser.ts` usando `self.onmessage/postMessage` e supporto opzionale per `SharedArrayBuffer` handshake.
   - **Node worker**: `CoreJS/src/worker/worker-node.ts` usando `worker_threads` (`parentPort.on('message')`) con lo stesso schema; fornire fallback che lancia `dist/scripts/worker-search.js` come processo figlio se `worker_threads` non è disponibile.
4. **Aggiornare pipeline di build**: aggiungere build targets in `CoreJS/package.json` per produrre `dist/worker-browser.js` (esbuild target=browser) e `dist/worker-node.js` (esbuild target=node). Pubblicare asset in `dist/`.
5. **Adattare engine orchestrator**: modificare `CoreJS/src/engine.node.ts` per preferire `worker_threads` e il nuovo protocollo postMessage; mantenere fallback NDJSON child_process fino alla validazione.
6. **Factory / API di creazione worker**: esporre `createWorker()` in `CoreJS/src/solver/worker-factory.ts` che restituisce un oggetto con API uniforme (`postMessage`, `terminate`, `onmessage`). GUI/Tauri/Electron useranno questa factory.
7. **Test, CI e headers**: aggiornare i test per usare i bundle precompilati; aggiornare server di test / CI a servire `Cross-Origin-Opener-Policy: same-origin` e `Cross-Origin-Embedder-Policy: require-corp` quando si usa `SharedArrayBuffer` per la TT condivisa. Aggiornare script CI per eseguire`cd CoreJS && pnpm build` prima dei test.
8. **Rollout incrementale**: rilasciare prima worker-node (desktop/server), poi worker-browser; tenere child_process fallback fino a che tutti i casi d'uso non vengono verificati.

**Relevant files**
- `CoreJS/src/engine.node.ts` — orchestrazione Node attuale, child_process/NDJSON.
- `CoreJS/src/browser-entry.ts` — entry browser esistente che chiama `search`.
- `CoreJS/src/solver/index.ts` — adapter pubblico che importa Node vs browser.
- `CoreJS/src/solver/search.ts` — algoritmo di ricerca; punto di estrazione principale.
- `CoreJS/src/moves/move.helpers.ts` — generazione pseudo-mosse.
- `CoreJS/scripts/worker-search.ts` — worker-process attuale (stdin/stdout NDJSON) usato in Node.
- `CoreJS/dist/scripts/worker-search.js` — build artifact; utile per fallback.
- `CoreJS/package.json` — aggiornare script/build targets.
- `Gui/sp-gui-angular/vitest.config.ts` — test server / mapping core.
- `Gui/popeye-js/out/popeye_ww.js` — esempio esistente di worker + wasm.

**Verification**
- Build core e worker bundles: `cd CoreJS && pnpm build`
- Eseguire i test unitari: `cd CoreJS && pnpm test`
- Eseguire i browser tests che usano workers (localmente): assicurare che il server risponda con `Cross-Origin-Opener-Policy: same-origin` e `Cross-Origin-Embedder-Policy: require-corp` quando si testa `SharedArrayBuffer`.
- Test integrato GUI: `pnpm dev` dal workspace root e verificare che l'interfaccia usi la factory per i worker e si adatti a Node/Browser.

**Decisions / Assumptions**
- Supportiamo `SharedArrayBuffer` quando disponibile; altrimenti usiamo scambio di messaggi tradizionale (più lento).
- Manteniamo fallback a `child_process` NDJSON per compatibilità Node older / ambienti headless finché non confermiamo `worker_threads` stabilità.
- Target runtime: Node LTS recente (>=16/18) per `worker_threads` stabile; se serve supporto più vecchio, resta il fallback.

**Further Considerations**
1. Tauri/Electron packaging: assicurarsi che il bundle worker sia incluso nei pacchetti e che i path asset siano risolti correttamente.
2. Performance: Shared TT via `SharedArrayBuffer` velocizza fortemente l'aggregazione; richiede cambi server/deployment per COOP/COEP.
3. Module formats: attenzione a ESM vs CJS per i worker Node — preferire ESM bundles o fornire build separate.

---

Se approvi, posso: 1) generare un prototipo minimo `worker-browser.ts` + `worker-node.ts` e aggiornare gli script di build in `CoreJS/package.json`, oppure 2) preparare una checklist PR che modifica `engine.node.ts` per usare `worker_threads` con fallback. Quale preferisci?
