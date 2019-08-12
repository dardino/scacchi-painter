import { NgModule } from "@angular/core";
import { ServerModule } from "@angular/platform-server";
import { ModuleMapLoaderModule } from "@nguniversal/module-map-ngfactory-loader";
import { AppComponent } from "./app.component";
import { AppModule } from "./app.module";
import { SpUicModule } from "projects/sp-uic/src/public-api";
import { SpDbmModule } from "projects/sp-dbm/src/public-api";

@NgModule({
  imports: [AppModule, ServerModule, ModuleMapLoaderModule, SpUicModule, SpDbmModule],
  bootstrap: [AppComponent]
})
export class AppServerModule {}
