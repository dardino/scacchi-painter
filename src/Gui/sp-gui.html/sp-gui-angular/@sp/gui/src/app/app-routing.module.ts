import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ViewProblemComponent } from "./view-problem/view-problem.component";
import { OpenfileComponent } from "./openfile/openfile.component";
import { DatabaseListComponent } from "./database-list/database-list.component";
import { ConfigurationComponent } from "./configuration/configuration.component";
import { LandingComponent } from "./landing/landing.component";
import { EditProblemComponent } from "./edit-problem/edit-problem.component";

const routes: Routes = [
  { path: "view/:id", component: ViewProblemComponent, pathMatch: "full" },
  { path: "edit/:id", component: EditProblemComponent, pathMatch: "full" },
  { path: "openfile", component: OpenfileComponent },
  { path: "list", component: DatabaseListComponent },
  { path: "config", component: ConfigurationComponent },
  { path: "", component: LandingComponent, pathMatch: "full" },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}