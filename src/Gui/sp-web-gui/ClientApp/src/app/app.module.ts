import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";

import { AppComponent } from "./app.component";
import { NavMenuComponent } from "./nav-menu/nav-menu.component";
import { HomeComponent } from "./home/home.component";
import { SpUicModule } from "projects/sp-uic/src/public-api";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatMenuModule } from "@angular/material/menu";
import {
  MatSidenavModule,
  MatToolbarModule,
  MatListModule,
  MatIconModule,
  MatButtonModule
} from "@angular/material";
import { OpenfileComponent } from "./openfile/openfile.component";
import { SpDbmModule } from "projects/sp-dbm/src/lib/sp-dbm.module";
import { SpDbmService, SpConvertersService, SpFenService } from "projects/sp-dbm/src/public-api";
import { ToolbarComponent } from "projects/sp-uic/src/lib/toolbar/toolbar.component";

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    OpenfileComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: "ng-cli-universal" }),
    HttpClientModule,
    FormsModule,
    SpUicModule,
    SpDbmModule.forRoot(),
    RouterModule.forRoot([
      { path: ""          , component: HomeComponent, pathMatch: "full" },
      { path: "openfile"  , component: OpenfileComponent },
      // { path: "counter"   , component: CounterComponent  },
      // { path: "fetch-data", component: FetchDataComponent }
    ]),
    BrowserAnimationsModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
