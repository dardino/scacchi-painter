import { CdkScrollableModule, ScrollingModule } from "@angular/cdk/scrolling";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
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
import { ChessboardModule } from "@sp/chessboard/src/public-api";
import { UiElementsModule } from "@sp/ui-elements/src/public-api";
import { environment } from "../environments/environment";

export const ThirdPartyModules = [
  CommonModule,
  MatButtonModule,
  MatIconModule,
  MatTooltipModule,
  BrowserModule,
  BrowserAnimationsModule,
  MatToolbarModule,
  UiElementsModule.config(environment.assetFolder),
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
];
