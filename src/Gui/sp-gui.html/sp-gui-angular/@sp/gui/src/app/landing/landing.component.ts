import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { environment } from "../../environments/environment";

@Component({
    selector: "app-landing",
    templateUrl: "./landing.component.html",
    styleUrls: ["./landing.component.less"],
    standalone: false
})
export class LandingComponent implements OnInit {

  public news: string = "";

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
