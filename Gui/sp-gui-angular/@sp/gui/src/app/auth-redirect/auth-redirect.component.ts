import { Component, inject, OnInit } from "@angular/core";
import { TokenResponse } from "@sp/dbmanager/src/lib/oauth_funcs/pkce";
import { getLocalAuthInfo, LocalAuthInfo, setLocalAuthInfo } from "@sp/dbmanager/src/lib/oauth_providers/helpers";
import { MsalAuthService } from "@sp/dbmanager/src/lib/oauth_providers/onedrive.cli";
import { LogService } from "../services/log.service";

@Component({
  selector: "app-auth-redirect",
  templateUrl: "./auth-redirect.component.html",
  styleUrls: ["./auth-redirect.component.scss"],

})
export class AuthRedirectComponent implements OnInit {
  #logService = inject(LogService);
  #msalService = inject(MsalAuthService);

  ngOnInit(): void {
    this.parseAuth();
  }

  async parseAuth() {
    const authInfo = getLocalAuthInfo();
    let response = false;
    // MSAL redirect
    switch (authInfo.redirect) {
      case "dropbox":
        response = await this.redirectFromDropbox(authInfo);
        break;
      case "onedrive":
        response = await this.redirectFromMsal(authInfo, this.#logService);
        break;
      case "null":
        response = false;
        break;
    }
    setTimeout(() => {
      if (response) {
        // Redirect to the original URL the user was on, or fallback to /openfile
        const returnUrl = authInfo.return_url || "/openfile/" + authInfo.redirect;
        location.href = returnUrl;
      }
      else {
        location.href = "/";
      }
    }, 100);
  }

  async redirectFromMsal(authInfo: Required<LocalAuthInfo>, logService: LogService) {
    try {
      logService.log("Redirected from MSAL..." + JSON.stringify(authInfo));
      // Use MsalAuthService which properly initializes and handles the redirect
      await this.#msalService.handleRedirect();
      setLocalAuthInfo({ onedrive_token: "authenticated" });
      return true;
    }
    catch (err) {
      console.error(err);
      return false;
    }
  }

  async redirectFromDropbox(authInfo: Required<LocalAuthInfo>) {
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
    }
    else {
      return false;
    }
  }
}
