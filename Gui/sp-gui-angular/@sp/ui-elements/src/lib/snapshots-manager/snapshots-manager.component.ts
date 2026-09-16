import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject } from "@angular/core";
import { MatAnchor, MatButton } from "@angular/material/button";
import { MatCard, MatCardActions, MatCardContent } from "@angular/material/card";
import { CurrentProblemService } from "@sp/dbmanager/src/lib/current-problem.service";
import { getFFenFromPosition } from "@sp/dbmanager/src/lib/helpers";
import { Problem } from "@sp/dbmanager/src/lib/models";
import { DialogService } from "../services/dialog.service";

@Component({
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: "lib-snapshots-manager",
  styleUrl: "./snapshots-manager.component.scss",
  templateUrl: "./snapshots-manager.component.html",
  imports: [MatCard, MatAnchor, MatButton, MatCardActions, MatCardContent],
})
export class SnapshotsManagerComponent {
  modalService = inject(DialogService);
  loadSnapshot(id: string) {
    // Ask to confirm before loading the snapshot due to losing unsaved changes
    this.modalService.confirmDialog({
      message: "Loading this snapshot will discard unsaved changes. Are you sure?",
      cancelText: "Cancel",
      confirmText: "Load",
      title: "Load Snapshot",
    }).subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.#current.Reload(id);
    });
  }

  deleteSnapshot(id: string) {
    // Ask for confirmation before deleting the snapshot using confirm dialog from modal service
    this.modalService.confirmDialog({
      message: "Are you sure you want to delete this snapshot?",
      cancelText: "Cancel",
      confirmText: "Delete",
      title: "Delete Snapshot",
    }).subscribe((confirmed) => {
      if (confirmed) {
        this.#current.RemoveSnapshot(id);
      }
    });
  }

  getFen(id: string): string {
    try {
      const snapshot = this.#current.Problem()?.getSnapshotProblem(id);
      if (!snapshot) {
        return "";
      }
      return getFFenFromPosition(snapshot);
    }
    catch (error) {
      console.error("Error getting FEN for snapshot:", error);
      return "";
    }
  }

  getSolutions(id: string): string {
    try {
      const snapshot = this.#current.Problem()?.getSnapshotProblem(id);
      if (!snapshot) {
        return "";
      }
      return snapshot.htmlSolution ?? "";
    }
    catch (error) {
      console.error("Error getting solutions for snapshot:", error);
      return "";
    }
  }

  #current = inject(CurrentProblemService);

  snapshots = computed(() => {
    const snapshots = this.#current.Problem()?.snapshots ?? {};
    return Object.entries(snapshots)
      .map(([id, snapshot]) => ({ id, snapshot }))
      .filter(({ snapshot, id }) =>
        snapshot !== null
        && snapshot !== undefined
        && id !== null
        && id !== Problem.SNAPSHOT_MAIN_ID);
  });
}
