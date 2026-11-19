import { CommonModule } from "@angular/common";
import { Component, inject, input, output } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { AvaliableFileServices } from "@sp/host-bridge/src/lib/fileService";
import { HostBridgeService } from "@sp/host-bridge/src/public-api";

@Component({
  selector: "lib-file-source-selector",
  templateUrl: "./file-source-selector.component.html",
  imports: [CommonModule, MatIconModule, MatButtonModule],
  standalone: true,
  styleUrls: ["./file-source-selector.component.scss"],
})
export class FileSourceSelectorComponent {
  private hostBridge = inject(HostBridgeService);
  public hideNew = input<boolean>();
  public current = input<"new" | AvaliableFileServices>();
  public sourceSelected = output<"new" | AvaliableFileServices>();
  public isCloudStorageAvailable = !this.hostBridge.isTauri;

  public selectSource(source: "new" | AvaliableFileServices) {
    this.sourceSelected.emit(source);
  }
}
