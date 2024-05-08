import { HttpClient } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AuthRedirectComponent } from "./auth-redirect/auth-redirect.component";
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
import { AllMatIconRegistry } from "./registerIcons";
import { SaveFileComponent } from "./save-file/save-file.component";
import { TwinDialogComponent } from "./twin-dialog/twin-dialog.component";

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
  ],
  imports: [
    ...ThirdPartyModules,
    AppRoutingModule,
  ],
  providers: [HttpClient, { provide: MatIconRegistry, useFactory: AllMatIconRegistry }],
  bootstrap: [AppComponent],
})
export class AppModule {}
