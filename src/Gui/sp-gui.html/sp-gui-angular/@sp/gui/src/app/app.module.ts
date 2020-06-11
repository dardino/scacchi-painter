import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { UiElementsModule } from "@sp/ui-elements/src/public-api";
import { HttpClientModule, HttpClient } from "@angular/common/http";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatGridListModule } from "@angular/material/grid-list";
import { ChessboardModule } from "@sp/chessboard/src/lib/chessboard.module";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatListModule } from "@angular/material/list";
import { ViewProblemComponent } from "./view-problem/view-problem.component";
import { MatIconModule } from "@angular/material/icon";
import { OpenfileComponent } from "./openfile/openfile.component";
import { DatabaseListComponent } from "./database-list/database-list.component";
import { MenuComponent } from "./menu/menu.component";
import { CdkScrollableModule, ScrollingModule } from "@angular/cdk/scrolling";
import { ConfigurationComponent } from "./configuration/configuration.component";
import { LandingComponent } from "./landing/landing.component";
import { MatButtonModule } from "@angular/material/button";
import { EditProblemComponent } from './edit-problem/edit-problem.component';
@NgModule({
  declarations: [
    AppComponent,
    ViewProblemComponent,
    OpenfileComponent,
    DatabaseListComponent,
    MenuComponent,
    ConfigurationComponent,
    LandingComponent,
    EditProblemComponent,
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    UiElementsModule,
    ChessboardModule,
    HttpClientModule,
    MatGridListModule,
    MatSidenavModule,
    MatListModule,
    CdkScrollableModule,
    ScrollingModule,
  ],
  providers: [HttpClient],
  bootstrap: [AppComponent],
})
export class AppModule {}
