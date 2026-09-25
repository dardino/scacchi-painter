/* eslint-disable no-console */
import { Configuration, LogLevel } from "@azure/msal-browser";
import { LogService } from "@sp/gui/src/app/services/log.service";

/**
 * Configuration class for @azure/msal-browser:
 * https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/modules/_src_config_configuration_.html
 */
export const MSAL_CONFIG: (customLogger: LogService | null) => Configuration = (customLogger: LogService | null) => ({
  auth: {
    clientId: "a1c79ff3-d67f-43c5-8178-1d89fb84e03a",
    onRedirectNavigate: (url) => {
      if (customLogger) customLogger.log("Redirecting to:", url);
      return true;
    },
  },
  cache: {
    cacheLocation: "localStorage", // This configures where your cache will be stored
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            if (customLogger) customLogger.error(message);
            console.error(message);
            return;
          case LogLevel.Info:
            if (customLogger) customLogger.info(message);
            console.info(message);
            return;
          case LogLevel.Verbose:
            if (customLogger) customLogger.debug(message);
            console.debug(message);
            return;
          case LogLevel.Warning:
            if (customLogger) customLogger.warn(message);
            console.warn(message);
            return;
        }
      },
    },
  },
});

const scopes = [
  "email",
  "Files.ReadWrite.All",
  "openid",
  "profile",
  "User.Read",
];

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
