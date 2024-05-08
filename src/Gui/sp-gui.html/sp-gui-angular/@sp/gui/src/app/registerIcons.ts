import { Injectable } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { environment } from "../environments/environment";

@Injectable({ providedIn: "root" })
export class AllMatIconRegistry {
  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    this.matIconRegistry.addSvgIcon(
      `select_piece`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${environment.assetFolder}/toolbar/select_piece.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `add_piece`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${environment.assetFolder}/toolbar/add_piece.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `remove_piece`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${environment.assetFolder}/toolbar/remove_piece.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `move_piece`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${environment.assetFolder}/toolbar/move_piece.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `dropbox_icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${environment.assetFolder}/toolbar/dropbox_icon.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `onedrive_icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${environment.assetFolder}/toolbar/onedrive_icon.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `my_flip_h`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${environment.assetFolder}/toolbar/fliph.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `my_flip_v`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${environment.assetFolder}/toolbar/flipv.svg`
      )
    );
  }
}
