import { OpenFileComponent } from "./open-file/open-file.component";
import { DatabaseListComponent } from "./database-list/database-list.component";
import { ConfigurationComponent } from "./configuration/configuration.component";
import { LandingComponent } from "./landing/landing.component";
import { EditProblemComponent } from "./edit-problem/edit-problem.component";
import { AuthRedirectComponent } from "./auth-redirect/auth-redirect.component";
import { SaveFileComponent } from "./save-file/save-file.component";
import { Routes } from "@angular/router";

const getRoutes = <T extends { [key: string]: Routes[number] }>(e: T): T => e;

export const RoutesList = getRoutes({
  edit: {
    path: "edit/:id",
    component: EditProblemComponent,
    pathMatch: "full",
  },
  open: { path: "openfile", component: OpenFileComponent },
  save: { path: "savefile", component: SaveFileComponent },
  list: { path: "list", component: DatabaseListComponent },
  redirect: { path: "redirect", component: AuthRedirectComponent },
  config: { path: "config", component: ConfigurationComponent },
  home: { path: "", component: LandingComponent, pathMatch: "full" },
});
