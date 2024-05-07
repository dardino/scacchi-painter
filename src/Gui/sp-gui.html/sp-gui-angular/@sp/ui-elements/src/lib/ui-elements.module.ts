import { DragDropModule } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCardModule } from "@angular/material/card";
import { MatDialogModule } from "@angular/material/dialog";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatSelectModule } from "@angular/material/select";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { QuillModule } from "ngx-quill";
import { ConfirmDialogComponent } from "./confirm-dialog/confirm-dialog.component";
import { DbsourceComponent } from "./dbsource/dbsource.component";
import { FileExplorerComponent } from "./file-explorer/file-explorer.component";
import { FileSourceSelectorComponent } from "./file-source-selector/file-source-selector.component";
import { ProblemAuthorsComponent } from "./problem-authors/problem-authors.component";
import { ProblemDefinitionsComponent } from "./problem-definitions/problem-definitions.component";
import { ProblemInfoComponent } from "./problem-info/problem-info.component";
import { ProblemPublicationComponent } from "./problem-publication/problem-publication.component";
import { QuillInitializeService } from "./services/quillInitialize.service";
import { SortableListComponent } from './sortable-list/sortable-list.component';
import { SpSolutionDescComponent } from "./sp-solution-desc/sp-solution-desc.component";
import { SpSolutionRowComponent } from "./sp-solution-row/sp-solution-row.component";
import { SpToolbarButtonComponent } from "./sp-toolbar-button/sp-toolbar-button.component";
import { ToolbarDbComponent } from "./toolbar-db/toolbar-db.component";
import { ToolbarEditComponent } from "./toolbar-edit/toolbar-edit.component";
import { ToolbarEngineComponent } from "./toolbar-engine/toolbar-engine.component";
import { ToolbarPieceComponent } from "./toolbar-piece/toolbar-piece.component";

@NgModule({
  declarations: [
    ToolbarDbComponent,
    SpToolbarButtonComponent,
    SpSolutionDescComponent,
    ProblemInfoComponent,
    ToolbarEditComponent,
    ToolbarPieceComponent,
    ToolbarEngineComponent,
    ProblemDefinitionsComponent,
    ProblemAuthorsComponent,
    ProblemPublicationComponent,
    FileExplorerComponent,
    FileSourceSelectorComponent,
    ConfirmDialogComponent,
    SpSolutionRowComponent,
    SortableListComponent,
    DbsourceComponent,
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatTooltipModule,
    MatButtonToggleModule,
    QuillModule.forRoot(),
    FormsModule,
    MatCardModule,
    MatGridListModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    DragDropModule,
    MatDialogModule,
    MatListModule,
  ],
  exports: [
    ToolbarDbComponent,
    SpToolbarButtonComponent,
    SpSolutionDescComponent,
    ProblemInfoComponent,
    ToolbarEditComponent,
    ToolbarEngineComponent,
    ToolbarPieceComponent,
    FileExplorerComponent,
    FileSourceSelectorComponent,
    DbsourceComponent,
  ],
  providers: [QuillInitializeService],
})
export class UiElementsModule {}
