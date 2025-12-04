import { inject, Injectable } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";

let assetFolder = ".";

@Injectable({
  providedIn: "root",
})
export class AllMatIconRegistryService {
  private matIconRegistry = inject(MatIconRegistry);
  private domSanitizer = inject(DomSanitizer);

  constructor() {
    this.matIconRegistry.addSvgIcon(
      `select_piece`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${assetFolder}/toolbar/select_piece.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `add_piece`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${assetFolder}/toolbar/add_piece.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `remove_piece`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${assetFolder}/toolbar/remove_piece.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `move_piece`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${assetFolder}/toolbar/move_piece.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `dropbox_icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${assetFolder}/toolbar/dropbox_icon.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `onedrive_icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${assetFolder}/toolbar/onedrive_icon.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `my_flip_h`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${assetFolder}/toolbar/fliph.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `my_flip_v`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${assetFolder}/toolbar/flipv.svg`
      )
    );
  }
  static registerAssetFolder = (_assetFolder: string) => {
    assetFolder = _assetFolder;
    return AllMatIconRegistryService;
  }
}
