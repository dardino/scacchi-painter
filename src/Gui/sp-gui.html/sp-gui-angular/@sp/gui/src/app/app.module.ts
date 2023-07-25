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
import { MatIconModule } from "@angular/material/icon";
import { OpenFileComponent } from "./open-file/open-file.component";
import { DatabaseListComponent } from "./database-list/database-list.component";
import { MenuComponent } from "./menu/menu.component";
import { CdkScrollableModule, ScrollingModule } from "@angular/cdk/scrolling";
import { ConfigurationComponent } from "./configuration/configuration.component";
import { LandingComponent } from "./landing/landing.component";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { EditProblemComponent } from "./edit-problem/edit-problem.component";
import { RecentsComponent } from "./recents/recents.component";
import { MatTabsModule } from "@angular/material/tabs";
import { TwinDialogComponent } from "./twin-dialog/twin-dialog.component";
import { MatDialogModule } from "@angular/material/dialog";
import { ConditionsDialogComponent } from "./conditions-dialog/conditions-dialog.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatTooltipModule } from "@angular/material/tooltip";
import { AuthRedirectComponent } from "./auth-redirect/auth-redirect.component";
import { ServiceWorkerModule } from "@angular/service-worker";
import { environment } from "../environments/environment";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { SaveFileComponent } from "./save-file/save-file.component";
import { DatabaseListItemComponent } from './database-list-item/database-list-item.component';

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
