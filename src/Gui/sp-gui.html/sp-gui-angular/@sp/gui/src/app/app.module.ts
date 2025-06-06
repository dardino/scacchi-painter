import { provideHttpClient, withFetch } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { AllMatIconRegistryService } from "@sp/ui-elements/src/lib/registerIcons";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AuthRedirectComponent } from "./auth-redirect/auth-redirect.component";
import { AuthorDialogComponent } from "./author-dialog/author-dialog.component";
import { ConditionsDialogComponent } from "./conditions-dialog/conditions-dialog.component";
import { ConfigurationComponent } from "./configuration/configuration.component";
import { DatabaseListItemComponent } from "./database-list-item/database-list-item.component";
import { DatabaseListComponent } from "./database-list/database-list.component";
import { EditProblemComponent } from "./edit-problem/edit-problem.component";
import { LandingComponent } from "./landing/landing.component";
import { MenuComponent } from "./menu/menu.component";
import { ThirdPartyModules } from "./modules";
import { OpenFileComponent } from "./open-file/open-file.component";
import { RecentsComponent } from "./recents/recents.component";
import { SaveFileComponent } from "./save-file/save-file.component";
import { TwinDialogComponent } from "./twin-dialog/twin-dialog.component";
import { ChessboardAnimationService } from "@sp/chessboard/src/lib/chessboard-animation.service";

@NgModule({
  declarations: [
    AppComponent,
    OpenFileComponent,
    DatabaseListComponent,
    MenuComponent,
    ConfigurationComponent,
    LandingComponent,
    EditProblemComponent,
    RecentsComponent,
    TwinDialogComponent,
    ConditionsDialogComponent,
    AuthRedirectComponent,
    SaveFileComponent,
    DatabaseListItemComponent,
    AuthorDialogComponent,
  ],
  imports: [
    ...ThirdPartyModules,
    AppRoutingModule,
  ],
  providers: [provideHttpClient(withFetch()), AllMatIconRegistryService, ChessboardAnimationService],
  bootstrap: [AppComponent],
})
export class AppModule {}
