/* eslint-disable no-console */

import { ApplicationRef, CUSTOM_ELEMENTS_SCHEMA, Component, OnInit, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckbox } from "@angular/material/checkbox";
import { MatAccordion, MatExpansionPanel, MatExpansionPanelDescription, MatExpansionPanelHeader, MatExpansionPanelTitle } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatOption, MatSelect } from "@angular/material/select";
import { ServiceWorkerModule, SwUpdate } from "@angular/service-worker";
import { concat, first, interval } from "rxjs";
import { environment } from "../../environments/environment";
import { PreferencesService } from "../services/preferences.service";
import { ThemeService } from "../services/theme.service";
import { AvailableThemes } from "../services/types";

@Component({
  selector: "app-configuration",
  templateUrl: "./configuration.component.html",
  styleUrls: ["./configuration.component.scss"],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    ServiceWorkerModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCheckbox,
    FormsModule,
    MatInputModule,
    ReactiveFormsModule,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatSelect,
    MatOption,
  ],
})
export class ConfigurationComponent implements OnInit {
  #preferences = inject(PreferencesService);
  #themeService = inject(ThemeService);

  availableThemes = this.#themeService.AllThemes;

  currentTheme = this.#preferences.chessboardTheme.asReadonly();
  setCurrentTheme(value: AvailableThemes) {
    this.#preferences.chessboardTheme.set(value);
  }

  editorHideBoardLabels = this.#preferences.chessboardLabels.asReadonly();
  changeEditorHideLabels(value: boolean) {
    this.#preferences.chessboardLabels.set(value);
  }

  whiteCellColor = this.#preferences.chessboardWhiteCellColor.asReadonly();
  changeWhiteCellColor(value: string) {
    this.#preferences.chessboardWhiteCellColor.set(value);
  }

  pieceWhiteColor = this.#preferences.chessboardPieceWhiteColor.asReadonly();
  changePieceWhiteColor(value: string) {
    this.#preferences.chessboardPieceWhiteColor.set(value);
  }

  pieceBlackColor = this.#preferences.chessboardPieceBlackColor.asReadonly();
  changePieceBlackColor(value: string) {
    this.#preferences.chessboardPieceBlackColor.set(value);
  }

  blackCellColor = this.#preferences.chessboardBlackCellColor.asReadonly();
  changeBlackCellColor(value: string) {
    this.#preferences.chessboardBlackCellColor.set(value);
  }

  editorApplyPieceShadow = this.#preferences.chessboardPieceShadow.asReadonly();
  changeEditorApplyPieceShadow(value: boolean) {
    this.#preferences.chessboardPieceShadow.set(value);
  }

  boardBorderColor = this.#preferences.chessboardBorderColor.asReadonly();
  changeBoardBorderColor(value: string) {
    this.#preferences.chessboardBorderColor.set(value);
  }

  editorShowExtraPieces = this.#preferences.editorShowExtraPieces.asReadonly();
  changeEditorShowExtraPieces(value: boolean) {
    this.#preferences.editorShowExtraPieces.set(value);
  }

  compactPieceSelector = this.#preferences.compactPieceSelector.asReadonly();
  changeCompactPieceSelector(value: boolean) {
    this.#preferences.compactPieceSelector.set(value);
  }

  constructor() {
    const appRef = inject(ApplicationRef);
    const swUpdate = inject(SwUpdate);

    // CHECK for UPDATES
    const appIsStable$ = appRef.isStable.pipe(first(isStable => isStable === true));
    const everySixHours$ = interval(6 * 60 * 60 * 1000);
    const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);
    if (environment.production) {
      everySixHoursOnceAppIsStable$.subscribe(async () => {
        try {
          const updateFound = await swUpdate.checkForUpdate();
          console.log(updateFound ? "A new version is available." : "Already on the latest version.");
        }
        catch (err) {
          console.error("Failed to check for updates:", err);
        }
      });

      // subscribe for app updates available
      swUpdate.versionUpdates.subscribe(async (evt) => {
        switch (evt.type) {
          case "VERSION_DETECTED":
            console.log(`Downloading new app version: ${evt.version.hash}`);
            break;
          case "VERSION_READY":
            {
              console.log(`Current app version: ${evt.currentVersion.hash}`);
              console.log(`New app version ready for use: ${evt.latestVersion.hash}`);
              const run = confirm(`New app version ready for use: ${evt.latestVersion.hash}\r\nRestart is reqired to load the new version.\r\nWould you like to restart the application now?`);
              if (run) {
                document.location.reload();
              }
            }
            break;
          case "VERSION_INSTALLATION_FAILED":
            console.log(`Failed to install app version '${evt.version.hash}': ${evt.error}`);
            break;
        }
      });
    }
  }

  version: string;

  ngOnInit(): void {
    this.version = environment.version;
  }

  reload() {
    location.href = "/?" + Math.random();
    location.href = "/";
  }
}
