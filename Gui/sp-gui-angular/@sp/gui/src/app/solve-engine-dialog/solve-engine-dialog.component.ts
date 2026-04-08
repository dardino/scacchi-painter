import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import {
    EngineConfiguration,
    EngineConfigurationsByEngine,
    EngineOptionKey,
    EngineOptionMeta,
    EngineOptionsByEngine,
    cloneEngineConfiguration,
    cloneEngineConfigurationsByEngine,
    createDefaultPopeyeEngineConfiguration,
    createDefaultSpCoreEngineConfiguration,
} from "@sp/dbmanager/src/lib/models/engine";
import { Engines } from "@sp/host-bridge/src/lib/bridge-global";

export interface SolveEngineDialogData {
  availableEngines: Engines[];
  engine: Engines;
  engineConfig: EngineConfiguration | null;
  engineConfigurationsByEngine: EngineConfigurationsByEngine | null;
}

export interface SolveEngineDialogResult {
  engine: Engines;
  engineConfig: EngineConfiguration;
  engineConfigurationsByEngine: EngineConfigurationsByEngine;
}

type EngineOptionState = { enabled: boolean; values: string[] };

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

  engineConfigurationsByEngine: EngineConfigurationsByEngine = this.buildEngineConfigurationsByEngine();
  optionStateByEngine: Partial<Record<Engines, Record<string, EngineOptionState>>> = this.buildOptionStateByEngine();

  get selectedEngineOptions(): Record<string, EngineOptionMeta> {
    return EngineOptionsByEngine[this.selectedEngine] ?? {};
  }

  get engineOptionEntries(): [EngineOptionKey, EngineOptionMeta][] {
    return (Object.entries(this.selectedEngineOptions) as [EngineOptionKey, EngineOptionMeta][])
      .sort(([a], [b]) => a.localeCompare(b));
  }

  get optionState(): Record<string, EngineOptionState> {
    return this.optionStateByEngine[this.selectedEngine] ?? {};
  }

  get hasEngineOptions(): boolean {
    return this.engineOptionEntries.length > 0;
  }

  clickCancel() {
    this.dialogRef.close();
  }

  clickSave() {
    this.availableEngines.forEach((engine) => {
      this.engineConfigurationsByEngine[engine] = this.buildEngineConfigurationForEngine(engine);
    });

    const selectedEngineConfiguration = this.getConfigForEngine(this.selectedEngine);

    this.dialogRef.close({
      engine: this.selectedEngine,
      engineConfig: selectedEngineConfiguration,
      engineConfigurationsByEngine: cloneEngineConfigurationsByEngine(this.engineConfigurationsByEngine) ?? {},
    });
  }

  optionIndexes(count: number): number[] {
    return Array.from({ length: count }, (_, index) => index);
  }

  setOptionEnabled(optionKey: EngineOptionKey, enabled: boolean) {
    const optionMeta = this.selectedEngineOptions[optionKey];
    if (!optionMeta) {
      return;
    }

    const currentState = this.optionState;
    if (enabled) {
      const existingValues = currentState[optionKey]?.values ?? [];
      currentState[optionKey] = {
        enabled: true,
        values: [...existingValues, ...Array(Math.max(0, optionMeta.argsCount - existingValues.length)).fill("")].slice(0, optionMeta.argsCount),
      };
      return;
    }

    delete currentState[optionKey];
  }

  setOptionArgValue(optionKey: EngineOptionKey, argIndex: number, value: string) {
    const optionMeta = this.selectedEngineOptions[optionKey];
    if (!optionMeta) {
      return;
    }

    const currentState = this.optionState;
    if (!currentState[optionKey]) {
      this.setOptionEnabled(optionKey, true);
    }

    const values = currentState[optionKey]?.values ?? Array(optionMeta.argsCount).fill("");
    values[argIndex] = value;
    currentState[optionKey] = {
      enabled: true,
      values,
    };
  }

  private buildEngineConfigurationsByEngine(): EngineConfigurationsByEngine {
    const persistedConfigs = cloneEngineConfigurationsByEngine(this.data.engineConfigurationsByEngine) ?? {};
    if (persistedConfigs.Popeye == null) {
      persistedConfigs.Popeye = cloneEngineConfiguration(this.data.engineConfig)
        ?? createDefaultPopeyeEngineConfiguration();
    }
    if (persistedConfigs.SpCore == null) {
      persistedConfigs.SpCore = createDefaultSpCoreEngineConfiguration();
    }

    return persistedConfigs;
  }

  private buildOptionStateByEngine(): Partial<Record<Engines, Record<string, EngineOptionState>>> {
    const stateByEngine: Partial<Record<Engines, Record<string, EngineOptionState>>> = {};

    (Object.keys(EngineOptionsByEngine) as Engines[]).forEach((engine) => {
      const optionsMeta = EngineOptionsByEngine[engine] ?? {};
      const baseConfig = this.engineConfigurationsByEngine[engine]
        ?? (engine === "Popeye"
          ? createDefaultPopeyeEngineConfiguration()
          : engine === "SpCore"
            ? createDefaultSpCoreEngineConfiguration()
            : {});
      const state: Record<string, EngineOptionState> = {};

      (Object.entries(optionsMeta) as [EngineOptionKey, EngineOptionMeta][]).forEach(([key, meta]) => {
        const currentValues = baseConfig[key] ?? [];
        if (!(key in baseConfig)) {
          return;
        }

        state[key] = {
          enabled: true,
          values: [...currentValues, ...Array(Math.max(0, meta.argsCount - currentValues.length)).fill("")].slice(0, meta.argsCount),
        };
      });

      stateByEngine[engine] = state;
    });

    return stateByEngine;
  }

  private buildEngineConfigurationForEngine(engine: Engines): EngineConfiguration {
    const config: EngineConfiguration = {};
    const optionsMeta = EngineOptionsByEngine[engine] ?? {};
    const engineState = this.optionStateByEngine[engine] ?? {};

    (Object.entries(optionsMeta) as [EngineOptionKey, EngineOptionMeta][]).forEach(([key, meta]) => {
      const current = engineState[key];
      if (!current?.enabled) {
        return;
      }

      config[key] = meta.argsCount > 0 ? current.values.map(value => value.trim()) : [];
    });

    return cloneEngineConfiguration(config) ?? {};
  }

  private getConfigForEngine(engine: Engines): EngineConfiguration {
    const config = this.engineConfigurationsByEngine[engine];
    if (config != null) {
      return cloneEngineConfiguration(config) ?? {};
    }

    if (engine === "Popeye") {
      return createDefaultPopeyeEngineConfiguration();
    }

    if (engine === "SpCore") {
      return createDefaultSpCoreEngineConfiguration();
    }

    return {};
  }
}
