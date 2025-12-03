import { HttpClient } from "@angular/common/http";
import { Component, OnInit, inject, signal } from "@angular/core";
import { MarkdownPipe } from "@sp/ui-elements/src/lib/markdown.pipe";
import { environment } from "../../environments/environment";
import { RecentsComponent } from "../recents/recents.component";

@Component({
    selector: "app-landing",
    templateUrl: "./landing.component.html",
    styleUrls: ["./landing.component.scss"],
    standalone: true,
    imports: [
      RecentsComponent,
      MarkdownPipe
    ]
})
export class LandingComponent implements OnInit {
  private http = inject(HttpClient);

  public news = signal("");

  ngOnInit(): void {
    this.http.get(`${environment.assetFolder}/release-notes.md`, { responseType: 'text' })
      .subscribe({
        next: (content: string) => {
          this.news.set(content);
        },
        error: (error) => {
          this.news.set(error.message);
        }
      });
  }

}
