import { provideHttpClient, withFetch } from "@angular/common/http";
import { enableProdMode } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideRouter } from "@angular/router";
import { provideServiceWorker } from "@angular/service-worker";
import { ChessboardAnimationService } from "@sp/chessboard/src/lib/chessboard-animation.service";
import { AllMatIconRegistryService } from "@sp/ui-elements/src/lib/registerIcons";
import { RoutesList } from "./app/app-routing-list";
import { AppComponent } from "./app/app.component";
import { environment } from "./environments/environment";
import { polyfillBridge } from "./webbridge";

if (environment.production) {
  enableProdMode();
}

polyfillBridge();

bootstrapApplication(AppComponent, {
  providers: [
     provideAnimations(),
     provideHttpClient(withFetch()),
     provideRouter(Object.entries(RoutesList).map(e => e[1])),
     AllMatIconRegistryService.registerAssetFolder(environment.assetFolder),
     ChessboardAnimationService,
     provideServiceWorker("ngsw-worker.js", { enabled: environment.production }),
  ],
}).catch(err => console.error(err));
