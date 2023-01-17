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
import { MatLegacyListModule as MatListModule } from "@angular/material/legacy-list";
import { MatIconModule } from "@angular/material/icon";
import { OpenFileComponent } from "./open-file/open-file.component";
import { DatabaseListComponent } from "./database-list/database-list.component";
import { MenuComponent } from "./menu/menu.component";
import { CdkScrollableModule, ScrollingModule } from "@angular/cdk/scrolling";
import { ConfigurationComponent } from "./configuration/configuration.component";
import { LandingComponent } from "./landing/landing.component";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatLegacyMenuModule as MatMenuModule } from "@angular/material/legacy-menu";
import { EditProblemComponent } from "./edit-problem/edit-problem.component";
import { RecentsComponent } from "./recents/recents.component";
import { MatLegacyTabsModule as MatTabsModule } from "@angular/material/legacy-tabs";
import { TwinDialogComponent } from "./twin-dialog/twin-dialog.component";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
import { ConditionsDialogComponent } from "./conditions-dialog/conditions-dialog.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from "@angular/material/legacy-autocomplete";
import { MatLegacyTooltipModule as MatTooltipModule } from "@angular/material/legacy-tooltip";
import { AuthRedirectComponent } from "./auth-redirect/auth-redirect.component";
import { ServiceWorkerModule } from "@angular/service-worker";
import { environment } from "../environments/environment";
import { MatLegacySnackBarModule as MatSnackBarModule } from "@angular/material/legacy-snack-bar";
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from "@angular/material/legacy-progress-spinner";
import { SaveFileComponent } from "./save-file/save-file.component";

@NgModule({
  declarations: [
    AppComponent,
    OpenFileComponent,
    DatabaseListComponent,
    MenuComponent,
    ConfigurationComponent,
    LandingComponent,
    EditProblemComponent,
    RecentsComponent,
    TwinDialogComponent,
    ConditionsDialogComponent,
    AuthRedirectComponent,
    SaveFileComponent,
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule,
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
    MatMenuModule,
    MatTabsModule,
    MatDialogModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: environment.production,
    }),
  ],
  providers: [HttpClient],
  bootstrap: [AppComponent],
})
export class AppModule {}
