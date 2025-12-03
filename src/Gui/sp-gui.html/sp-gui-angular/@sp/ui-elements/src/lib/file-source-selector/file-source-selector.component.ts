import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { Router } from "@angular/router";
import { AvaliableFileServices } from "@sp/host-bridge/src/lib/fileService";

@Component({
    selector: "lib-file-source-selector",
    templateUrl: "./file-source-selector.component.html",
    imports: [CommonModule, MatIconModule, MatButtonModule],
    standalone: true,
    styleUrls: ["./file-source-selector.component.less"],
})
export class FileSourceSelectorComponent {
  private router = inject(Router);

  @Input()
  public hideNew: boolean;
  @Input()
  public current: "new" | AvaliableFileServices;
  @Output()
  public sourceSelected = new EventEmitter<"new" | AvaliableFileServices>();

  public selectSource(source: "new" | AvaliableFileServices) {
    // Navigate to the route with the source parameter
    this.router.navigate(['/openfile', source]);
    // Also emit the event for backward compatibility
    this.sourceSelected.emit(source);
  }
}
