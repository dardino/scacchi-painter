import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { OpenfileComponent } from "./openfile/openfile.component";

const routes: Routes = [
  { path: "", component: HomeComponent, pathMatch: "full" },
  { path: "openfile", component: OpenfileComponent },
  // { path: "counter"   , component: CounterComponent  },
  // { path: "fetch-data", component: FetchDataComponent }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
