import { provideHttpClient } from "@angular/common/http";
import { enableProdMode, provideZonelessChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { provideServiceWorker } from "@angular/service-worker";
import { ChessboardAnimationService } from "@sp/chessboard/src/lib/chessboard-animation.service";
import { AllMatIconRegistryService } from "@sp/ui-elements/src/lib/registerIcons";
import { RoutesList } from "./app/app-routing-list";
import { AppComponent } from "./app/app.component";
import { polyfillBridge } from "./bridges/web/web.bridge";
import { environment } from "./environments/environment";
import { initializeSettings } from "./app/services/settings.storage";

import "@dardino/chess-board";

if (environment.production) {
  enableProdMode();
}

polyfillBridge();

async function bootstrap() {
  // Settings must be loaded before components create their signals so that
  // they start with the persisted values instead of the defaults.
  await initializeSettings();

  await bootstrapApplication(AppComponent, {
    providers: [
      provideZonelessChangeDetection(),
      provideHttpClient(),
      provideRouter(Object.entries(RoutesList).map(e => e[1])),
      AllMatIconRegistryService.registerAssetFolder(environment.assetFolder),
      ChessboardAnimationService,
      provideServiceWorker("ngsw-worker.js", { enabled: environment.production }),
    ],
  });
}

bootstrap().catch(err => console.error(err));
