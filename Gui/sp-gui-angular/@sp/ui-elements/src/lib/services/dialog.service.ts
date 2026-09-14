import { Injectable, inject } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Author } from "@sp/dbmanager/src/lib/models";
import { Twin } from "@sp/dbmanager/src/lib/models/twin";
import { Engines } from "@sp/host-bridge/src/lib/bridge-global";
import { AuthorDialogComponent } from "../author-dialog/author-dialog.component";
import { ConditionsDialogComponent } from "../conditions-dialog/conditions-dialog.component";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { FairypieceDialogComponent, FairypieceDialogInput, FairypieceDialogResponse } from "../fairypiece-dialog/fairypiece-dialog.component";
import { SolveEngineDialogComponent, SolveEngineDialogData, SolveEngineDialogResult } from "../solve-engine-dialog/solve-engine-dialog.component";
import { TwinDialogComponent } from "../twin-dialog/twin-dialog.component";

@Injectable({
  providedIn: "root",
})
export class DialogService {
  private dialog = inject(MatDialog);

  confirmDialog(data: ConfirmDialogData) {
    return this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
      data,
    }).afterClosed();
  }

  fairypieceDialog(data: FairypieceDialogInput) {
    return this.dialog.open<FairypieceDialogComponent, FairypieceDialogInput, FairypieceDialogResponse>(FairypieceDialogComponent, {
      data,
    }).afterClosed();
  }

  twinDialog(data: Twin) {
    return this.dialog.open<TwinDialogComponent, Twin, Twin | null>(
      TwinDialogComponent,
      {
        minWidth: "25rem",
        maxWidth: "95%",
        data: Twin.fromJson(data?.toJson() ?? {}),
      },
    ).afterClosed();
  }

  fairyConditions() {
    return this.dialog.open<ConditionsDialogComponent, void, string>(
      ConditionsDialogComponent,
      {
        width: "25rem",
        maxWidth: "95%",
      },
    ).afterClosed();
  }

  authors(data: Author | null) {
    return this.dialog.open<AuthorDialogComponent, Author | null, Author | null>(
      AuthorDialogComponent,
      {
        width: "25rem",
        maxWidth: "95%",
        data,
      },
    ).afterClosed();
  }

  solverEngineSettings(input: SolveEngineDialogData) {
    return this.dialog.open<SolveEngineDialogComponent, {
      availableEngines: Engines[];
      engine: Engines;
      engineConfig: SolveEngineDialogResult["engineConfig"] | null;
      engineConfigurationsByEngine: SolveEngineDialogResult["engineConfigurationsByEngine"] | null;
    }, SolveEngineDialogResult | null>(
      SolveEngineDialogComponent,
      {
        data: {
          availableEngines: input.availableEngines,
          engine: input.engine,
          engineConfig: input.engineConfig,
          engineConfigurationsByEngine: input.engineConfigurationsByEngine,
        },
      },
    ).afterClosed();
  }
}

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}
