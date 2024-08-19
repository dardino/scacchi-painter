import { Component, OnInit } from "@angular/core";
import { PublicClientApplication } from "@azure/msal-browser";
import { TokenResponse } from "@sp/dbmanager/src/lib/oauth_funcs/pkce";
import { LocalAuthInfo, getLocalAuthInfo, setLocalAuthInfo } from "@sp/dbmanager/src/lib/oauth_providers/helpers";
import { MSAL_CONFIG } from "@sp/dbmanager/src/public-api";

@Component({
  selector: "app-auth-redirect",
  templateUrl: "./auth-redirect.component.html",
  styleUrls: ["./auth-redirect.component.less"],
})
export class AuthRedirectComponent implements OnInit {
  constructor() { }

  private myMsal = new PublicClientApplication(MSAL_CONFIG);

  ngOnInit(): void {
    this.parseAuth();
  }

  async parseAuth() {
    const authInfo = getLocalAuthInfo();
    let response = false;
    // MSAL redirect
    switch (authInfo.redirect) {
      case "dropbox":
        response = await this.redirectDropbox(authInfo);
        break;
      case "onedrive":
        response = await this.redirectMsal(authInfo);
        break;
      case "null":
        response = false;
        break;
    }
    setTimeout(() => {
      if (response) {
        const urlredirect = "/openfile#" + authInfo.redirect;
        location.href = urlredirect;
      } else {
        location.href = "/";
      }
    }, 100);

  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async redirectMsal(authInfo: Required<LocalAuthInfo>) {
    const response = await this.myMsal
      .handleRedirectPromise()
      .then((sal) => {
        setLocalAuthInfo({ onedrive_token: JSON.stringify(sal) });
        return true;
      })
      .catch((err) => {
        console.error(err);
        return false;
      });
    return response;
  }

  async redirectDropbox(authInfo: Required<LocalAuthInfo>) {
    const search = new URLSearchParams(`?${location.hash.substring(1)}`);
    const tokenMessage: TokenResponse = {
      uid: search.get("uid") ?? "",
      access_token: search.get("access_token") ?? "",
      token_type: search.get("token_type") ?? "",
      state: search.get("state") ?? "",
      scope: search.get("scope") ?? "",
      account_id: search.get("account_id") ?? "",
    };
    const state = authInfo.state;
    if (tokenMessage.state === state && state !== "") {
      setLocalAuthInfo({ dropbox_token: JSON.stringify(tokenMessage) });
      return true;
    } else {
      return false;
    }
  }
}
