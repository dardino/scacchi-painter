import { Component, OnInit } from "@angular/core";
import { PublicClientApplication } from "@azure/msal-browser";
import { TokenResponse } from "@sp/dbmanager/src/lib/oauth_funcs/pkce";
import { MSAL_CONFIG } from "@sp/dbmanager/src/public-api";

@Component({
  selector: "app-auth-redirect",
  templateUrl: "./auth-redirect.component.html",
  styleUrls: ["./auth-redirect.component.less"],
})
export class AuthRedirectComponent implements OnInit {
  constructor() {}

  private myMsal = new PublicClientApplication(MSAL_CONFIG);

  ngOnInit(): void {
    // MSAL redirect
    const hash = localStorage.getItem("redirect")?.split("#")[1];
    if (hash === "onedrive") {
      this.myMsal
        .handleRedirectPromise()
        .then((sal) => {
          console.log(sal);
          localStorage.setItem("onedrive_token", JSON.stringify(sal));
          setTimeout(() => {
            const urlredirect = localStorage.getItem("redirect") ?? "/openfile";
            location.href = urlredirect;
          }, 100);
          })
        .catch((err) => {
          console.error(err);
        });
    }

    // Dropbox redirect
    if (hash === "dropbox") {
      const search = new URLSearchParams(`?${location.hash}`);
      const tokenMessage: TokenResponse = {
        uid: search.get("uid") ?? "",
        access_token: search.get("access_token") ?? "",
        token_type: search.get("token_type") ?? "",
        state: search.get("state") ?? "",
        scope: search.get("scope") ?? "",
        account_id: search.get("account_id") ?? "",
      };
      const state = localStorage.getItem("state") ?? "";
      if (tokenMessage.state === state && state !== "") {
        localStorage.setItem("dropbox_token", JSON.stringify(tokenMessage));
        setTimeout(() => {
          const urlredirect = localStorage.getItem("redirect") ?? "/openfile";
          location.href = urlredirect;
        }, 100);
      } else {
        location.href = "/";
      }
    }
  }
}
