# Plan: Riorganizzare GitHub Actions con logica trigger-based

Consolida i due workflow attuali (master/nightly) in tre workflow specializzati, gestendo correttamente gli eventi: push su master (build+test+deploy nightly), MR verso master (build+test), e tag (build+test+deploy standard). Utilizza un workflow riusabile per build+test+lint per evitare duplicazione di codice.

## Steps

### 1. Crea workflow riusabile `.github/workflows/reusable-ci.yml`
   - Job: checkout, setup Node LTS, install pnpm, install dipendenze, lint (`pnpm lint`), build (`pnpm build:Azure`), test (`pnpm test:ci`)
   - Working directory: `./src/Gui/sp-gui.html/sp-gui-angular`
   - Output: segnala successo/fallimento per job downstream

### 2. Crea workflow `ci-pull-request.yml` per MR verso master
   - Trigger: `pull_request: [opened, synchronize, reopened]` su master
   - Chiama workflow riusabile `.github/workflows/reusable-ci.yml`
   - Nessun deploy

### 3. Crea workflow `ci-push-master.yml` per push su master
   - Trigger: `push` branch master
   - Chiama workflow riusabile `.github/workflows/reusable-ci.yml`
   - Job deploy: dipende da riusabile, deploya a Azure SWA con `deployment_environment: "nightly"`
   - Cleanup PR environment "release"

### 4. Crea workflow `ci-tag.yml` per tag release
   - Trigger: `push` con `tags: ['v*']`
   - Chiama workflow riusabile `.github/workflows/reusable-ci.yml`
   - Job deploy: dipende da riusabile, deploya a Azure SWA senza `deployment_environment` (production)
   - Job release-notes: aggiunge URL production `https://orange-sea-080bc3503.azurestaticapps.net/` alle release note GitHub

### 5. Mantieni workflow `close-pr.yml` per cleanup PR
   - Trigger: `pull_request: [closed]` su master
   - Job: cleanup ambiente "release" in Azure SWA

### 6. Elimina i due workflow attuali
   - `azure-static-web-apps-orange-sea-080bc3503.nightly.yml`
   - `azure-static-web-apps-orange-sea-080bc3503.yml`
   - Backup file prima della cancellazione
   - Verifica che tutti i nuovi workflow siano attivi su master

### 7. Testa la pipeline
   - Testa con push/PR/tag su branch `release/0.1.0` prima di applicare a master

## Dettagli Implementazione

### Workflow Riusabile (reusable-ci.yml)
- Definisce job riutilizzabile con steps per: checkout, Node setup, pnpm install, install deps, lint, build, test
- Permette di essere chiamato da altri workflow tramite `uses`
- Working directory configurabile ma default su sp-gui-angular

### Trigger e Destinazioni
| Trigger | Workflow | Deploy Env | URL |
|---------|----------|-----------|-----|
| Push master | ci-push-master.yml | nightly | https://orange-sea-080bc3503-nightly.westeurope.azurestaticapps.net/ |
| PR su master | ci-pull-request.yml | release (staging) | N/A (staging) |
| Tag v* | ci-tag.yml | production | https://orange-sea-080bc3503.azurestaticapps.net/ |

### URLs Siti
- Production: `https://orange-sea-080bc3503.azurestaticapps.net/`
- Nightly: `https://orange-sea-080bc3503-nightly.westeurope.azurestaticapps.net/`

### Azure SWA Configuration
- API Token: `${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_ORANGE_SEA_080BC3503 }}`
- App Location: `/src/Gui/sp-gui.html/sp-gui-angular/dist/gui/browser`
- API Location: `/src/Gui/sp-gui.html/sp-gui-angular/api`
- Skip App Build: `true` (fatto da GitHub Actions)
