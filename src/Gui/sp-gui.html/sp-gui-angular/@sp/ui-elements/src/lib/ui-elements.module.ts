import { NgModule } from "@angular/core";
import { DbToolbarComponent } from "./db-toolbar/db-toolbar.component";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { CommonModule } from "@angular/common";
import { SpToolbarButtonComponent } from "./sp-toolbar-button/sp-toolbar-button.component";
@NgModule({
  declarations: [DbToolbarComponent, SpToolbarButtonComponent],
  imports: [CommonModule, MatIconModule, MatButtonModule, MatToolbarModule],
  exports: [DbToolbarComponent, SpToolbarButtonComponent],
})
export class UiElementsModule {}
