import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { MarkdownPipe } from "@sp/ui-elements/src/lib/markdown.pipe";
import { environment } from "../../environments/environment";
import { RecentsComponent } from "../recents/recents.component";

@Component({
    selector: "app-landing",
    templateUrl: "./landing.component.html",
    styleUrls: ["./landing.component.less"],
    standalone: true,
    imports: [
      RecentsComponent,
      MarkdownPipe
    ]
})
export class LandingComponent implements OnInit {

  public news = "";

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get(`${environment.assetFolder}/release-notes.md`, { responseType: 'text' })
      .subscribe({
        next: (content: string) => {
          this.news = content;
        },
        error: (error) => {
          this.news = error.message;
        }
      });
  }

}
