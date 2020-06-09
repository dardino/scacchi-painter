import { NgModule } from "@angular/core";
import { DbToolbarComponent } from "./db-toolbar/db-toolbar.component";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { CommonModule } from "@angular/common";
import { SpToolbarButtonComponent } from "./sp-toolbar-button/sp-toolbar-button.component";
import { SpSolutionDescComponent } from "./sp-solution-desc/sp-solution-desc.component";
@NgModule({
  declarations: [
    DbToolbarComponent,
    SpToolbarButtonComponent,
    SpSolutionDescComponent,
  ],
  imports: [CommonModule, MatIconModule, MatButtonModule, MatToolbarModule],
  exports: [
    DbToolbarComponent,
    SpToolbarButtonComponent,
    SpSolutionDescComponent,
  ],
})
export class UiElementsModule {}
