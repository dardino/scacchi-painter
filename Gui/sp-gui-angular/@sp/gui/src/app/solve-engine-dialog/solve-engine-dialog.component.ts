import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { EngineConfiguration, EngineOptionKey, EngineOptions, cloneEngineConfiguration, createDefaultPopeyeEngineConfiguration } from "@sp/dbmanager/src/lib/models/engine";
import { Engines } from "@sp/host-bridge/src/lib/bridge-global";

export interface SolveEngineDialogData {
  availableEngines: Engines[];
  engine: Engines;
  engineConfig: EngineConfiguration | null;
}

export interface SolveEngineDialogResult {
  engine: Engines;
  engineConfig: EngineConfiguration;
}

type EngineOptionMeta = (typeof EngineOptions)[EngineOptionKey];

@Component({
  selector: "app-solve-engine-dialog",
  templateUrl: "./solve-engine-dialog.component.html",
  styleUrls: ["./solve-engine-dialog.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
})
export class SolveEngineDialogComponent {
  dialogRef = inject<MatDialogRef<SolveEngineDialogComponent, SolveEngineDialogResult | null>>(MatDialogRef);
  data = inject<SolveEngineDialogData>(MAT_DIALOG_DATA);

  availableEngines: Engines[] = this.data.availableEngines.length > 0 ? [...new Set(this.data.availableEngines)] as Engines[] : ["Popeye"];
  selectedEngine: Engines = this.availableEngines.includes(this.data.engine) ? this.data.engine : this.availableEngines[0] ?? "Popeye";

  engineOptionEntries = Object.entries(EngineOptions) as [EngineOptionKey, EngineOptionMeta][];

  optionState = this.buildOptionState();

  get isPopeye() {
    return this.selectedEngine === "Popeye";
  }

  clickCancel() {
    this.dialogRef.close();
  }

  clickSave() {
    this.dialogRef.close({
      engine: this.selectedEngine,
      engineConfig: this.isPopeye ? this.buildEngineConfiguration() : {},
    });
  }

  optionIndexes(count: number): number[] {
    return Array.from({ length: count }, (_, index) => index);
  }

  private buildOptionState() {
    const baseConfig = this.data.engineConfig ?? createDefaultPopeyeEngineConfiguration();
    const state = {} as Record<EngineOptionKey, { enabled: boolean; values: string[] }>;

    this.engineOptionEntries.forEach(([key, meta]) => {
      const currentValues = baseConfig[key] ?? [];
      state[key] = {
        enabled: key in baseConfig,
        values: [...currentValues, ...Array(Math.max(0, meta.argsCount - currentValues.length)).fill("")].slice(0, meta.argsCount),
      };
    });

    return state;
  }

  private buildEngineConfiguration(): EngineConfiguration {
    const config: EngineConfiguration = {};

    this.engineOptionEntries.forEach(([key, meta]) => {
      const current = this.optionState[key];
      if (!current?.enabled) {
        return;
      }

      config[key] = meta.argsCount > 0 ? current.values.map(value => value.trim()) : [];
    });

    return cloneEngineConfiguration(config) ?? {};
  }
}
