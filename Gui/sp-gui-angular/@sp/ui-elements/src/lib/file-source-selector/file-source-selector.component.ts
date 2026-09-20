import { CommonModule } from "@angular/common";
import { Component, input, output } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { AvaliableFileServices } from "@sp/host-bridge/src/lib/fileService";

@Component({
  selector: "lib-file-source-selector",
  templateUrl: "./file-source-selector.component.html",
  imports: [CommonModule, MatIconModule, MatButtonModule],
  standalone: true,
  styleUrls: ["./file-source-selector.component.scss"],
})
export class FileSourceSelectorComponent {
  public hideNew = input<boolean>();
  public current = input<"new" | AvaliableFileServices>();
  public sourceSelected = output<"new" | AvaliableFileServices>();

  public selectSource(source: "new" | AvaliableFileServices) {
    this.sourceSelected.emit(source);
  }
}
