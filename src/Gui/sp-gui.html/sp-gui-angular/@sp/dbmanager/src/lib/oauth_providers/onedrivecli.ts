import {
  AccountInfo,
  AuthenticationResult,
  Configuration,
  EndSessionRequest,
  InteractionRequiredAuthError,
  LogLevel,
  PopupRequest,
  PublicClientApplication,
  RedirectRequest,
  SilentRequest,
  SsoSilentRequest,
} from "@azure/msal-browser";
import { getLocalAuthInfo, setLocalAuthInfo } from "./helpers";

/**
 * Configuration class for @azure/msal-browser:
 * https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/modules/_src_config_configuration_.html
 */
export const MSAL_CONFIG: Configuration = {
  auth: {
    clientId: "a1c79ff3-d67f-43c5-8178-1d89fb84e03a",
  },
  cache: {
    cacheLocation: "localStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            // eslint-disable-next-line no-console
            console.info(message);
            return;
          case LogLevel.Verbose:
            // eslint-disable-next-line no-console
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
    },
  },
};

const scopes = ["email", "Files.ReadWrite", "openid", "profile", "User.Read"];

/**
 * AuthModule for application - handles authentication in app.
 */
export class AuthModule {
  // eslint-disable-next-line max-len
  // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/classes/_src_app_publicclientapplication_.publicclientapplication.html
  private myMSALObj: PublicClientApplication;
  // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-common/modules/_src_account_accountinfo_.html
  private account: AccountInfo | null;
  // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/modules/_src_request_redirectrequest_.html
  private loginRedirectRequest: RedirectRequest;
  // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/modules/_src_request_popuprequest_.html
  private loginRequest: PopupRequest;
  private profileRedirectRequest: RedirectRequest;
  private profileRequest: PopupRequest;
  private mailRedirectRequest: RedirectRequest;
  private mailRequest: PopupRequest;
  // https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/modules/_src_request_silentrequest_.html
  private silentProfileRequest: SilentRequest;
  private silentMailRequest: SilentRequest;
  private silentLoginRequest: SsoSilentRequest;

  constructor() {
    this.myMSALObj = new PublicClientApplication(MSAL_CONFIG);
    this.account = null;

    this.loginRequest = {
      scopes: [...scopes],
      redirectUri: `${location.origin}/redirect`,
    };

    this.loginRedirectRequest = {
      ...this.loginRequest,
      redirectStartPage: `${location.origin}/redirect`,
    };

    this.profileRequest = {
      scopes: ["User.Read"],
    };

    this.profileRedirectRequest = {
      ...this.profileRequest,
      redirectStartPage: window.location.href,
    };

    // Add here scopes for access token to be used at MS Graph API endpoints.
    this.mailRequest = {
      scopes: ["Mail.Read"],
    };

    this.mailRedirectRequest = {
      ...this.mailRequest,
      redirectStartPage: window.location.href,
    };

    this.silentProfileRequest = {
      scopes: ["openid", "profile", "User.Read"],
      forceRefresh: false,
    };

    this.silentMailRequest = {
      scopes: ["openid", "profile", "Mail.Read"],
      forceRefresh: false,
    };

    this.silentLoginRequest = {
      loginHint: "IDLAB@msidlab0.ccsctp.net",
    };
  }

  /**
   * Calls getAllAccounts and determines the correct account to sign into, currently defaults to first account found in cache.
   * TODO: Add account chooser code
   *
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
   */
  private getAccount(): AccountInfo | null {
    // need to call getAccount here?
    const currentAccounts = this.myMSALObj.getAllAccounts();
    if (currentAccounts === null) {
      console.log("No accounts detected");
      return null;
    }

    if (currentAccounts.length > 1) {
      // Add choose account code here
      console.log(
        "Multiple accounts detected, need to add choose account code."
      );
      return currentAccounts[0];
    } else if (currentAccounts.length === 1) {
      return currentAccounts[0];
    }

    return null;
  }

  /**
   * Checks whether we are in the middle of a redirect and handles state accordingly. Only required for redirect flows.
   *
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/initialization.md#redirect-apis
   */
  loadAuthModule(): void {
    this.myMSALObj
      .handleRedirectPromise()
      .then((resp: AuthenticationResult | null) => {
        this.handleResponse(resp);
      })
      .catch(console.error);
  }

  /**
   * Handles the response from a popup or redirect. If response is null, will check if we have any accounts and attempt to sign in.
   *
   * @param response
   */
  handleResponse(response: AuthenticationResult | null) {
    if (response !== null) {
      this.account = response.account;
    } else {
      this.account = this.getAccount();
    }
  }

  /**
   * Calls ssoSilent to attempt silent flow. If it fails due to interaction required error, it will prompt the user to login using popup.
   *
   * @param request
   */
  attemptSsoSilent() {
    this.myMSALObj
      .ssoSilent(this.silentLoginRequest)
      .then(() => {
        this.account = this.getAccount();
        if (!this.account) {
          console.log("No account!");
        }
      })
      .catch((error) => {
        console.error("Silent Error: " + error);
        if (error instanceof InteractionRequiredAuthError) {
          this.login("loginPopup");
        }
      });
  }

  /**
   * Calls loginPopup or loginRedirect based on given signInType.
   *
   * @param signInType
   */
  login(signInType: string): void {
    if (signInType === "loginPopup") {
      this.myMSALObj
        .loginPopup(this.loginRequest)
        .then((resp: AuthenticationResult) => {
          this.handleResponse(resp);
        })
        .catch(console.error);
    } else if (signInType === "loginRedirect") {
      this.myMSALObj.loginRedirect(this.loginRedirectRequest);
    }
  }

  /**
   * Logs out of current account.
   */
  logout(): void {
    let account: AccountInfo | undefined;
    if (this.account) {
      account = this.account;
    }
    const logOutRequest: EndSessionRequest = {
      account,
    };

    this.myMSALObj.logout(logOutRequest);
  }

  /**
   * Gets the token to read user profile data from MS Graph silently, or falls back to interactive redirect.
   */
  async getProfileTokenRedirect(): Promise<string | null> {
    if (this.account) {
      this.silentProfileRequest.account = this.account;
    }
    return this.getTokenRedirect(
      this.silentProfileRequest,
      this.profileRedirectRequest
    );
  }

  /**
   * Gets the token to read user profile data from MS Graph silently, or falls back to interactive popup.
   */
  async getProfileTokenPopup(): Promise<string | null> {
    if (this.account) {
      this.silentProfileRequest.account = this.account;
    }
    return this.getTokenPopup(this.silentProfileRequest, this.profileRequest);
  }

  /**
   * Gets the token to read mail data from MS Graph silently, or falls back to interactive redirect.
   */
  async getMailTokenRedirect(): Promise<string | null> {
    if (this.account) {
      this.silentMailRequest.account = this.account;
    }
    return this.getTokenRedirect(
      this.silentMailRequest,
      this.mailRedirectRequest
    );
  }

  /**
   * Gets the token to read mail data from MS Graph silently, or falls back to interactive popup.
   */
  async getMailTokenPopup(): Promise<string | null> {
    if (this.account) {
      this.silentMailRequest.account = this.account;
    }
    return this.getTokenPopup(this.silentMailRequest, this.mailRequest);
  }

  /**
   * Gets a token silently, or falls back to interactive popup.
   */
  private async getTokenPopup(
    silentRequest: SilentRequest,
    interactiveRequest: PopupRequest
  ): Promise<string | null> {
    try {
      const response: AuthenticationResult = await this.myMSALObj.acquireTokenSilent(
        silentRequest
      );
      return response.accessToken;
    } catch (e) {
      console.log("silent token acquisition fails.");
      if (e instanceof InteractionRequiredAuthError) {
        console.log("acquiring token using redirect");
        return this.myMSALObj
          .acquireTokenPopup(interactiveRequest)
          .then((resp) => resp.accessToken)
          .catch((err) => {
            console.error(err);
            return null;
          });
      } else {
        console.error(e);
      }
    }

    return null;
  }

  /**
   * Gets a token silently, or falls back to interactive redirect.
   */
  private async getTokenRedirect(
    silentRequest: SilentRequest,
    interactiveRequest: RedirectRequest
  ): Promise<string | null> {
    try {
      const response = await this.myMSALObj.acquireTokenSilent(silentRequest);
      return response.accessToken;
    } catch (e) {
      console.log("silent token acquisition fails.");
      if (e instanceof InteractionRequiredAuthError) {
        console.log("acquiring token using redirect");
        this.myMSALObj
          .acquireTokenRedirect(interactiveRequest)
          .catch(console.error);
      } else {
        console.error(e);
      }
    }

    return null;
  }
}

export const getOneDriveToken = async () => {
  const { onedrive_token } = getLocalAuthInfo();
  const localToken = JSON.parse(onedrive_token) as AuthenticationResult | null;

  if (localToken != null) {
    localToken.expiresOn = new Date((localToken.expiresOn as unknown) as string);
    if (localToken.expiresOn.valueOf() > Date.now()) {
      return localToken;
    }
  }
  setLocalAuthInfo({ redirect: "onedrive" });
  const ms = new AuthModule();
  ms.login("loginRedirect");
  return null;
};
