import { CdkScrollableModule, ScrollingModule } from "@angular/cdk/scrolling";
import { CommonModule } from "@angular/common";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTabsModule } from "@angular/material/tabs";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ServiceWorkerModule } from "@angular/service-worker";
import { ChessboardModule } from "@sp/chessboard/src/lib/chessboard.module";
import { UiElementsModule } from "@sp/ui-elements/src/public-api";
import { environment } from "../environments/environment";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AuthRedirectComponent } from "./auth-redirect/auth-redirect.component";
import { ConditionsDialogComponent } from "./conditions-dialog/conditions-dialog.component";
import { ConfigurationComponent } from "./configuration/configuration.component";
import { DatabaseListItemComponent } from "./database-list-item/database-list-item.component";
import { DatabaseListComponent } from "./database-list/database-list.component";
import { EditProblemComponent } from "./edit-problem/edit-problem.component";
import { LandingComponent } from "./landing/landing.component";
import { MenuComponent } from "./menu/menu.component";
import { OpenFileComponent } from "./open-file/open-file.component";
import { RecentsComponent } from "./recents/recents.component";
import { SaveFileComponent } from "./save-file/save-file.component";
import { TwinDialogComponent } from "./twin-dialog/twin-dialog.component";

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
    DatabaseListItemComponent,
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
