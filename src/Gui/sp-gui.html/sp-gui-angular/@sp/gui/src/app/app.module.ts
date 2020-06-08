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
import { HomeComponent } from "./home/home.component";
import { MatIconModule } from "@angular/material/icon";
import { OpenfileComponent } from "./openfile/openfile.component";

@NgModule({
  declarations: [AppComponent, HomeComponent, OpenfileComponent],
  imports: [
    CommonModule,
    MatIconModule,
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
  ],
  providers: [HttpClient],
  bootstrap: [AppComponent],
})
export class AppModule {}
