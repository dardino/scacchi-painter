import { ToolbarDbComponent } from "./toolbar-db/toolbar-db.component";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCardModule } from "@angular/material/card";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatFormFieldModule } from "@angular/material/form-field";
import { CommonModule } from "@angular/common";
import { SpToolbarButtonComponent } from "./sp-toolbar-button/sp-toolbar-button.component";
import { SpSolutionDescComponent } from "./sp-solution-desc/sp-solution-desc.component";
import { ProblemInfoComponent } from "./problem-info/problem-info.component";
import { ToolbarEditComponent } from "./toolbar-edit/toolbar-edit.component";
import { ToolbarEngineComponent } from "./toolbar-engine/toolbar-engine.component";
import { ToolbarPieceComponent } from "./toolbar-piece/toolbar-piece.component";
import { NgModule } from "@angular/core";
import { QuillModule } from "ngx-quill";
import { FormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";

import { QuillInitializeService } from "./services/quillInitialize.service";
import { ProblemDefinitionsComponent } from "./problem-definitions/problem-definitions.component";
import { ProblemAuthorsComponent } from "./problem-authors/problem-authors.component";
import { ProblemPublicationComponent } from "./problem-publication/problem-publication.component";
@NgModule({
  declarations: [
    ToolbarDbComponent,
    SpToolbarButtonComponent,
    SpSolutionDescComponent,
    ProblemInfoComponent,
    ToolbarEditComponent,
    ToolbarEngineComponent,
    ToolbarPieceComponent,
    ProblemDefinitionsComponent,
    ProblemAuthorsComponent,
    ProblemPublicationComponent,
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatButtonToggleModule,
    QuillModule.forRoot(),
    FormsModule,
    MatCardModule,
    MatGridListModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  exports: [
    ToolbarDbComponent,
    SpToolbarButtonComponent,
    SpSolutionDescComponent,
    ProblemInfoComponent,
    ToolbarEditComponent,
    ToolbarEngineComponent,
    ToolbarPieceComponent,
  ],
  providers: [QuillInitializeService],
})
export class UiElementsModule {}
