import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppComponent } from "./app/app.component";
import { environment } from "./environments/environment";
import { polyfillBridge } from "./webbridge";

if (environment.production) {
  enableProdMode();
}

polyfillBridge();

platformBrowserDynamic()
  .bootstrapModule(AppComponent)
  .catch((err) => console.error(err));
