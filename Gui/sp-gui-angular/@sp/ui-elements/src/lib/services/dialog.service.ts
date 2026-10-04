import { Injectable, inject } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Author, Problem } from "@sp/dbmanager/src/lib/models";
import { Twin } from "@sp/dbmanager/src/lib/models/twin";
import { Awards } from "@sp/dbmanager/src/lib/SPX.v5";
import { Engines } from "@sp/host-bridge/src/lib/bridge-global";
import { AuthorDialogComponent } from "../author-dialog/author-dialog.component";
import { AwardProblemDecisionData, AwardProblemDecisionDialogComponent, AwardProblemDecisionResult } from "../award-problem-decision-dialog/award-problem-decision-dialog.component";
import { ConditionsDialogComponent } from "../conditions-dialog/conditions-dialog.component";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { FairypieceDialogComponent, FairypieceDialogInput, FairypieceDialogResponse } from "../fairypiece-dialog/fairypiece-dialog.component";
import { SolveEngineDialogComponent, SolveEngineDialogData, SolveEngineDialogResult } from "../solve-engine-dialog/solve-engine-dialog.component";
import { TwinDialogComponent } from "../twin-dialog/twin-dialog.component";
import { VerdictDialogComponent, VerdictDialogData } from "../verdict-dialog/verdict-dialog.component";

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

  verdictDialog(data: Awards | null, mode: "view" | "create" | "edit" = "view") {
    const award = data ?? {
      awardsTitle: "",
      awardsDescription: "",
      awardsDate: new Date().toISOString().slice(0, 10),
      awardsJudge: "",
      awardsProblems: [],
    };

    return this.dialog.open<VerdictDialogComponent, VerdictDialogData, Awards | null>(
      VerdictDialogComponent,
      {
        width: "28rem",
        maxWidth: "95%",
        data: {
          mode,
          award,
        },
      },
    ).afterClosed();
  }

  awardProblemDecisionDialog(problem: Problem) {
    return this.dialog.open<AwardProblemDecisionDialogComponent, AwardProblemDecisionData, AwardProblemDecisionResult>(
      AwardProblemDecisionDialogComponent,
      {
        width: "36rem",
        maxWidth: "95vw",
        disableClose: true,
        data: { problem },
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
