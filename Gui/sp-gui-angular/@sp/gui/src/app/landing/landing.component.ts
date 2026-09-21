import { HttpClient } from "@angular/common/http";
import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { MarkdownPipe } from "@sp/ui-elements/src/lib/markdown.pipe";
import { environment } from "../../environments/environment";
import { RecentsComponent } from "../recents/recents.component";
import { TipBannerComponent } from "../uiElements/tip-banner/tip-banner.component";
import { TipsEngine } from "./tips-engine";

@Component({
  selector: "app-landing",
  templateUrl: "./landing.component.html",
  styleUrls: ["./landing.component.scss"],
  standalone: true,
  imports: [
    RecentsComponent,
    MarkdownPipe,
    TipBannerComponent,
  ],
})
export class LandingComponent implements OnInit {
  private http = inject(HttpClient);
  private readonly tipsEngine = new TipsEngine();

  public news = signal("");
  public readonly currentTip = signal("");
  public readonly showTipsBanner = signal(false);
  public readonly hasNextTip = computed(() => this.tipsEngine.tips().length > 1);
  public readonly hasPrevTip = computed(() => this.tipsEngine.tips().length > 1);

  ngOnInit(): void {
    this.http.get(`${environment.assetFolder}/release-notes.md`, { responseType: "text" })
      .subscribe({
        next: (content: string) => {
          this.news.set(content);
        },
        error: (error) => {
          this.news.set(error.message);
        },
      });

    this.http.get(`${environment.assetFolder}/tips.json`, { responseType: "json" }).subscribe({
      next: (raw: unknown) => {
        const availableTips = this.tipsEngine.loadTipsFromJson(raw);
        this.syncTips(availableTips);
      },
      error: () => {
        this.showTipsBanner.set(false);
      },
    });
  }

  public nextTip(): void {
    const next = this.tipsEngine.nextTip();
    this.currentTip.set(next ?? "");
    this.showTipsBanner.set(this.currentTip() !== "");
    void this.tipsEngine.syncWithIndexedDB(this.tipsEngine.tips());
  }

  public prevTip(): void {
    const prev = this.tipsEngine.prevTip();
    this.currentTip.set(prev ?? "");
    this.showTipsBanner.set(this.currentTip() !== "");
    void this.tipsEngine.syncWithIndexedDB(this.tipsEngine.tips());
  }

  public hideTips(): void {
    this.tipsEngine.showTipsAtStartup.set(false);
    this.showTipsBanner.set(false);
    void this.tipsEngine.syncWithIndexedDB(this.tipsEngine.tips());
  }

  private async syncTips(tips: string[]): Promise<void> {
    if (tips.length === 0) {
      this.showTipsBanner.set(false);
      return;
    }

    const state = await this.tipsEngine.syncWithIndexedDB(tips);
    this.tipsEngine.showTipsAtStartup.set(state.showTipsAtStartup);

    if (!state.showTipsAtStartup) {
      this.showTipsBanner.set(false);
      return;
    }

    const selected = this.tipsEngine.selectTip();
    if (selected == null) {
      this.showTipsBanner.set(false);
      return;
    }

    this.currentTip.set(selected);
    this.showTipsBanner.set(true);
  }
}
