import { Configuration, LogLevel } from "@azure/msal-browser";

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

export const REQUESTS = {
  LOGIN: {
    scopes: [...scopes],
    redirectUri: `${location.origin}/redirect`,
  },
  SILENT: {
    scopes: ["openid", "profile", "User.Read"],
    redirectUri: `${location.origin}/redirect`,
    forceRefresh: false,
  },
};
