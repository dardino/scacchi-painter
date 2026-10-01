import { Component, inject, OnInit } from "@angular/core";
import { TokenResponse } from "@sp/dbmanager/src/lib/oauth_funcs/pkce";
import { exchangeGoogleDriveCode } from "@sp/dbmanager/src/lib/oauth_providers/google-drive.cli";
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
      case "googledrive":
        response = await this.redirectFromGoogle(authInfo);
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
      this.#logService.error(`Redirect from MSAL failed: ${err instanceof Error ? err.message : String(err)}`);
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

  async redirectFromGoogle(authInfo: Required<LocalAuthInfo>) {
    const search = new URLSearchParams(location.search);
    const code = search.get("code") ?? "";
    const state = search.get("state") ?? "";
    const scope = search.get("scope") ?? "";
    const verifier = authInfo.google_code_verifier || "";

    this.#logService.debug(`Google redirect debug: ${JSON.stringify({
      redirect: authInfo.redirect,
      savedState: authInfo.state,
      incomingState: state,
      hasCodeVerifier: verifier.length > 0,
      returnUrl: authInfo.return_url,
    })}`);

    if (code === "") {
      return false;
    }

    if (state && state !== authInfo.state) {
      return false;
    }

    try {
      const tokens = await exchangeGoogleDriveCode(code, verifier || undefined);
      if (!tokens.access_token) {
        this.#logService.error(`Google Drive token exchange returned no access_token: ${JSON.stringify(tokens)}`);
        return false;
      }

      setLocalAuthInfo({
        google_token: JSON.stringify({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token ?? "",
          expiry_date: tokens.expiry_date ?? Date.now() + 3600_000,
          scope: tokens.scope ?? scope,
          token_type: tokens.token_type ?? "Bearer",
        }),
        google_code_verifier: "",
      });

      return true;
    }
    catch (error) {
      this.#logService.error(`Google Drive token exchange failed: ${JSON.stringify({
        code,
        state,
        savedState: authInfo.state,
        verifierLength: verifier.length,
        error: error instanceof Error ? error.message : String(error),
      })}`);
      return false;
    }
  }
}
