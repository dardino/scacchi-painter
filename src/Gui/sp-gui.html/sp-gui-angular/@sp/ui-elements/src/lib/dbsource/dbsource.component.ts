import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AvaliableFileServices } from '@sp/host-bridge/src/lib/fileService';

@Component({
    selector: 'lib-dbsource',
    templateUrl: './dbsource.component.html',
    imports: [CommonModule],
    styleUrl: './dbsource.component.less',
})
export class DbsourceComponent {

  static mapDesc: Record<AvaliableFileServices, string> = {
    dropbox: "Dropbox",
    onedrive: "One Drive",
    local: "Local",
    unknown: "In memory"
  };

  @Input() source: AvaliableFileServices;
  get sourceDesc(): string {
    return DbsourceComponent.mapDesc[this.source];
  }
}
