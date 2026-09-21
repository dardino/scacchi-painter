// Create the main myMSALObj instance

import { inject, Injectable } from "@angular/core";
import { PublicClientApplication, RedirectRequest } from "@azure/msal-browser";
import { LogService } from "@sp/gui/src/app/services/log.service";
import { MSAL_CONFIG } from "./onedrive.config";

@Injectable({ providedIn: "root" })
export class MsalAuthService {
  #logService = inject(LogService);
  #msal = new PublicClientApplication(MSAL_CONFIG(this.#logService));

  async initialize() {
    return await this.#msal.initialize();
  }

  login() {
    const request: RedirectRequest = {
      scopes: ["Files.ReadWrite", "User.Read"],
    };

    return this.#msal.loginRedirect(request);
  }

  async getToken() {
    const accounts = this.#msal.getAllAccounts();
    if (accounts.length === 0) return null;

    const result = await this.#msal.acquireTokenSilent({
      account: accounts[0],
      scopes: ["Files.ReadWrite"],
    });

    return result.accessToken;
  }

  handleRedirect() {
    return this.#msal.handleRedirectPromise();
  }
}
