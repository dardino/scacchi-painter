// Create the main myMSALObj instance

import { inject, Injectable } from "@angular/core";
import { PublicClientApplication, RedirectRequest } from "@azure/msal-browser";
import { LogService } from "@sp/gui/src/app/services/log.service";
import { MSAL_CONFIG, REQUESTS } from "./onedrive.config";

@Injectable({ providedIn: "root" })
export class MsalAuthService {
  #logService = inject(LogService);
  #msal = new PublicClientApplication(MSAL_CONFIG(this.#logService));

  async initialize() {
    try {
      return await this.#msal.initialize();
    }
    catch (error) {
      this.#logService.error(`Failed to initialize MSAL: ${(error as Error).message}`);
      throw error;
    }
  }

  login() {
    const request: RedirectRequest = {
      ...REQUESTS.LOGIN,
    };
    return this.#msal.loginRedirect(request);
  }

  async getToken() {
    const accounts = this.#msal.getAllAccounts();
    if (accounts.length === 0) return null;

    const result = await this.#msal.acquireTokenSilent({
      account: accounts[0],
      ...REQUESTS.SILENT,
    }).catch((error) => {
      this.#logService.info(`Failed to acquire token silently: ${(error as Error).message}`);
      return null;
    });
    if (!result) {
      await this.#msal.loginRedirect({
        ...REQUESTS.LOGIN,
      });
    }

    return result?.accessToken ?? null;
  }

  handleRedirect() {
    return this.#msal.handleRedirectPromise();
  }
}
