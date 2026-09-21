import { Component, EventEmitter, Output, input } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-tip-banner",
  templateUrl: "./tip-banner.component.html",
  styleUrl: "./tip-banner.component.scss",
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule],
})
export class TipBannerComponent {
  public readonly tip = input<string>("");
  public readonly hasNext = input<boolean>(false);
  public readonly hasPrev = input<boolean>(false);

  @Output() public readonly nextTip = new EventEmitter<void>();
  @Output() public readonly prevTip = new EventEmitter<void>();
  @Output() public readonly hideTips = new EventEmitter<void>();

  public onNext(): void {
    this.nextTip.emit();
  }

  public onPrev(): void {
    this.prevTip.emit();
  }

  public onHide(): void {
    this.hideTips.emit();
  }
}
