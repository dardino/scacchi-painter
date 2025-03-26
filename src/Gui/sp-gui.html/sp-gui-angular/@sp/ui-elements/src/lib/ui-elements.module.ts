import { ModuleWithProviders, NgModule } from "@angular/core";
import { AuthorCardComponent } from "./author-card/author-card.component";
import { ConfirmDialogComponent } from "./confirm-dialog/confirm-dialog.component";
import { DbsourceComponent } from "./dbsource/dbsource.component";
import { FileExplorerComponent } from "./file-explorer/file-explorer.component";
import { FileSourceSelectorComponent } from "./file-source-selector/file-source-selector.component";
import { MarkdownPipe } from "./markdown.pipe";
import { ProblemAuthorsComponent } from "./problem-authors/problem-authors.component";
import { ProblemDefinitionsComponent } from "./problem-definitions/problem-definitions.component";
import { ProblemInfoComponent } from "./problem-info/problem-info.component";
import { ProblemPublicationComponent } from "./problem-publication/problem-publication.component";
import { registerAssetFolder } from "./registerIcons";
import { SortableListComponent } from './sortable-list/sortable-list.component';
import { SpSolutionDescComponent } from "./sp-solution-desc/sp-solution-desc.component";
import { SpSolutionRowComponent } from "./sp-solution-row/sp-solution-row.component";
import { SpToolbarButtonComponent } from "./sp-toolbar-button/sp-toolbar-button.component";
import { ThirdPartyImports } from "./thirdPartyImports";
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
    SpSolutionRowComponent,
    SortableListComponent,
    DbsourceComponent,
    MarkdownPipe,
  ],
  imports: [
    ...ThirdPartyImports,
    ConfirmDialogComponent,
    AuthorCardComponent,
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
    AuthorCardComponent,
    MarkdownPipe,
  ],
})
export class UiElementsModule {
  static config(assetFolder: string): ModuleWithProviders<UiElementsModule> {
    registerAssetFolder(assetFolder);
    return { ngModule: UiElementsModule, providers: [UiElementsModule] };
  }
}
