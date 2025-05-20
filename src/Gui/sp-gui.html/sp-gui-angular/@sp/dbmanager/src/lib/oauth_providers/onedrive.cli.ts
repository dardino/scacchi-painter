// Create the main myMSALObj instance

import { AccountInfo, AuthenticationResult, InteractionRequiredAuthError, PopupRequest, PublicClientApplication, SilentRequest } from "@azure/msal-browser";
import { MSAL_CONFIG, REQUESTS } from "./onedrive.config";


class OneDriveCliProvider {
  private constructor() { }

  // configuration parameters are located at authConfig.js
  static #myMSALObj = new PublicClientApplication(MSAL_CONFIG);
  static #accountId: string;

  static async initialize() {
    // Redirect: once login is successful and redirects with tokens, call Graph API
    try {
      await this.#myMSALObj.initialize();
      const resp = await this.#myMSALObj.handleRedirectPromise();
      await this.handleResponse(resp);
    } catch (error) {
      console.error(error);
    }
  }

  static async #ssoSilent(): Promise<void | AuthenticationResult | Error> {
    try {
      const response = await this.#myMSALObj.ssoSilent(REQUESTS.LOGIN);
      this.#accountId = response.account.homeAccountId;
      this.showWelcomeMessage(response.account);
      return await this.getTokenRedirect(REQUESTS.LOGIN, response.account);
    } catch (error) {
      return error as Error;
    }
  }

  static async handleResponse(resp: AuthenticationResult | null) {
    if (resp !== null) {
      this.#accountId = resp.account.homeAccountId;
      this.#myMSALObj.setActiveAccount(resp.account);
      this.showWelcomeMessage(resp.account);
    } else {
      // need to call getAccount here?
      const currentAccounts = this.#myMSALObj.getAllAccounts();
      if (!currentAccounts || currentAccounts.length < 1) {
        const result = await this.#ssoSilent();
        if (result instanceof Error) {
          console.error("Silent Error: " + result);
          if (result instanceof InteractionRequiredAuthError) {
            await this.#myMSALObj.acquireTokenRedirect(REQUESTS.LOGIN);
          }
        }
      } else if (currentAccounts.length > 1) {
        // Add choose account code here
      } else if (currentAccounts.length === 1) {
        const activeAccount = currentAccounts[0];
        this.#myMSALObj.setActiveAccount(activeAccount);
        this.#accountId = activeAccount.homeAccountId;
        this.showWelcomeMessage(activeAccount);
      }
    }
  }

  static async signIn(method: "popup" | "redirect") {
    if (method === "popup") {
      return this.#myMSALObj.loginPopup(REQUESTS.LOGIN).then(this.handleResponse).catch(function (error) {
        console.error(error);
      });
    } else if (method === "redirect") {
      return this.#myMSALObj.loginRedirect(REQUESTS.LOGIN);
    }
  }

  static signOut(interactionType: "popup" | "redirect") {
    const logoutRequest = {
      account: this.#myMSALObj.getAccount({homeAccountId: this.#accountId}),
    };

    if (interactionType === "popup") {
      this.#myMSALObj.logoutPopup(logoutRequest).then(() => {
        window.location.reload();
      });
    } else {
      this.#myMSALObj.logoutRedirect(logoutRequest);
    }
  }

  static async getTokenPopup(request: PopupRequest | SilentRequest) {
    return await this.#myMSALObj.acquireTokenSilent(request).catch(async (error) => {
      console.warn("silent token acquisition fails.");
      if (error instanceof InteractionRequiredAuthError) {
        console.warn("acquiring token using popup");
        return this.#myMSALObj.acquireTokenPopup(request).catch(error => {
          console.error(error);
        });
      } else {
        console.error(error);
      }
    });
  }

  // This function can be removed if you do not need to support IE
  static async getTokenRedirect(request: PopupRequest | SilentRequest, _accountInfo?: AccountInfo) {
    return await this.#myMSALObj.acquireTokenSilent(request).catch(async (error) => {
      console.warn("silent token acquisition fails.");
      if (error instanceof InteractionRequiredAuthError) {
        // fallback to interaction when silent call fails
        console.warn("acquiring token using redirect");
        this.#myMSALObj.acquireTokenRedirect(request);
      } else {
        console.error(error);
      }
    });
  }

  static showWelcomeMessage(account: AccountInfo) {
    console.warn("Welcome " + account.username);
  }

  static async getToken() {
    await OneDriveCliProvider.initialize();
    return await this.getTokenRedirect(REQUESTS.LOGIN);
  }
}

export { OneDriveCliProvider };
