// Create the main myMSALObj instance

import { AccountInfo, AuthenticationResult, InteractionRequiredAuthError, PopupRequest, PublicClientApplication, SilentRequest } from "@azure/msal-browser";
import { setLocalAuthInfo } from "./helpers";
import { MSAL_CONFIG, REQUESTS } from "./onedrive.config";


class OneDriveCliProvider {
  private constructor() { }

  // configuration parameters are located at authConfig.js
  // Lazy initialization to avoid crypto errors in test environment
  static #myMSALObj: PublicClientApplication | null = null;
  static #accountId: string;

  static #getMSALObj(): PublicClientApplication {
    if (!this.#myMSALObj) {
      this.#myMSALObj = new PublicClientApplication(MSAL_CONFIG);
    }
    return this.#myMSALObj;
  }

  static async initialize() {
    // Redirect: once login is successful and redirects with tokens, call Graph API
    try {
      await this.#getMSALObj().initialize();
      const resp = await this.#getMSALObj().handleRedirectPromise();
      await this.handleResponse(resp);
    } catch (error) {

      console.error(error);
    }
  }

  static async handleResponse(resp: AuthenticationResult | null) {
    if (resp !== null) {
      this.#accountId = resp.account.homeAccountId;
      this.#getMSALObj().setActiveAccount(resp.account);
      this.showWelcomeMessage(resp.account);
    } else {
      // need to call getAccount here?
      const currentAccounts = this.#getMSALObj().getAllAccounts();
      if (!currentAccounts || currentAccounts.length < 1) {
        // No accounts found, redirect to login
        // eslint-disable-next-line no-console
        console.log("No accounts found, redirecting to login");
        setLocalAuthInfo({
          redirect: "onedrive",
          return_url: location.pathname + location.hash,
        });
        await this.#getMSALObj().loginRedirect(REQUESTS.LOGIN);
      } else if (currentAccounts.length > 1) {
        // Add choose account code here
      } else if (currentAccounts.length === 1) {
        const activeAccount = currentAccounts[0];
        this.#getMSALObj().setActiveAccount(activeAccount);
        this.#accountId = activeAccount.homeAccountId;
        this.showWelcomeMessage(activeAccount);
      }
    }
  }

  static async signIn(method: "popup" | "redirect") {
    if (method === "popup") {
      return this.#getMSALObj().loginPopup(REQUESTS.LOGIN).then(this.handleResponse).catch(function (error) {
        console.error(error);
      });
    } else if (method === "redirect") {
      return this.#getMSALObj().loginRedirect(REQUESTS.LOGIN);
    }
  }

  static signOut(interactionType: "popup" | "redirect") {
    const logoutRequest = {
      account: this.#getMSALObj().getAccount({homeAccountId: this.#accountId}),
    };

    if (interactionType === "popup") {
      this.#getMSALObj().logoutPopup(logoutRequest).then(() => {
        window.location.reload();
      });
    } else {
      this.#getMSALObj().logoutRedirect(logoutRequest);
    }
  }

  static async getTokenPopup(request: PopupRequest | SilentRequest) {
    return await this.#getMSALObj().acquireTokenSilent(request).catch(async (error) => {
      console.warn("silent token acquisition fails.");
      if (error instanceof InteractionRequiredAuthError) {
        console.warn("acquiring token using popup");
        return this.#getMSALObj().acquireTokenPopup(request).catch(error => {
          console.error(error);
        });
      } else {
        console.error(error);
      }
    });
  }

  // This function can be removed if you do not need to support IE
  static async getTokenRedirect(request: PopupRequest | SilentRequest, _accountInfo?: AccountInfo) {
    return await this.#getMSALObj().acquireTokenSilent(request).catch(async (error) => {
      console.warn("silent token acquisition fails.");
      if (error instanceof InteractionRequiredAuthError) {
        // fallback to interaction when silent call fails
        console.warn("acquiring token using redirect");
        setLocalAuthInfo({
          redirect: "onedrive",
          return_url: location.pathname + location.hash,
        });
        this.#getMSALObj().acquireTokenRedirect(request);
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
