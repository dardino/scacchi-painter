import { NgModule } from "@angular/core";
import { SpDbmService } from "./sp-dbm.service";
import { SpFenService } from "./sp-fen.service";
import { SpConvertersService } from "./sp-converters.service";

@NgModule({
  declarations: [],
  imports: [],
  exports: [SpDbmService, SpFenService, SpConvertersService]
})
export class SpDbmModule {}
