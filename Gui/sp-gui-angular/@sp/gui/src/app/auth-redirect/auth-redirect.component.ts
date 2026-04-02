import { Component, OnInit } from "@angular/core";
import { TokenResponse } from "@sp/dbmanager/src/lib/oauth_funcs/pkce";
import { LocalAuthInfo, getLocalAuthInfo, setLocalAuthInfo } from "@sp/dbmanager/src/lib/oauth_providers/helpers";
import { OneDriveCliProvider } from "@sp/dbmanager/src/lib/oauth_providers/onedrive.cli";

@Component({
  selector: "app-auth-redirect",
  templateUrl: "./auth-redirect.component.html",
  styleUrls: ["./auth-redirect.component.scss"],

})
export class AuthRedirectComponent implements OnInit {
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
        // Redirect to the original URL the user was on, or fallback to /openfile
        const returnUrl = authInfo.return_url || "/openfile#" + authInfo.redirect;
        location.href = returnUrl;
      }
      else {
        location.href = "/";
      }
    }, 100);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async redirectMsal(authInfo: Required<LocalAuthInfo>) {
    try {
      // Use OneDriveCliProvider which properly initializes and handles the redirect
      await OneDriveCliProvider.initialize();
      setLocalAuthInfo({ onedrive_token: "authenticated" });
      return true;
    }
    catch (err) {
      console.error(err);
      return false;
    }
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
    }
    else {
      return false;
    }
  }
}
