import { NgModule, ModuleWithProviders, Optional, SkipSelf } from "@angular/core";
import { SpFenService } from "./sp-fen.service";
import { SpConvertersService } from "./sp-converters.service";
import { SpDbmService } from "./sp-dbm.service";
@NgModule({
  declarations: [],
  imports: [],
  exports: []
})
export class SpDbmModule {
  constructor(@Optional() @SkipSelf() parentModule: SpDbmModule) {
    if (parentModule) {
      throw new Error("SpDbmModule is already loaded. Import it in the AppModule only");
    }
  }

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SpDbmModule,
      providers: [SpDbmService, SpFenService, SpConvertersService]
    };
  }
}
