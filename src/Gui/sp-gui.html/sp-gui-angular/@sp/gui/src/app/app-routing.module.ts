import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { RoutesList } from "./app-routing-list";
@NgModule({
  imports: [RouterModule.forRoot(Object.entries(RoutesList).map(e => e[1]))],
  exports: [RouterModule],
})
export class AppRoutingModule {}
