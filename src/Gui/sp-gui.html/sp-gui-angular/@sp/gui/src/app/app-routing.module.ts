import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { OpenfileComponent } from "./openfile/openfile.component";
import { DatabaseListComponent } from "./database-list/database-list.component";
import { ConfigurationComponent } from "./configuration/configuration.component";

const routes: Routes = [
  { path: "", component: HomeComponent, pathMatch: "full" },
  { path: "openfile", component: OpenfileComponent },
  { path: "list", component: DatabaseListComponent },
  { path: "config", component: ConfigurationComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
