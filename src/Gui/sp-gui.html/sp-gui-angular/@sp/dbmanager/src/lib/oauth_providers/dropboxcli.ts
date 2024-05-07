import {
  generateStateString,
  getImplicitAuthorizationUrl,
  TokenResponse,
} from "../oauth_funcs/pkce";
import { getLocalAuthInfo, setLocalAuthInfo } from "./helpers";

export const getDropboxToken = async (): Promise<TokenResponse | null> => {

  const dropbox_token = getLocalAuthInfo().dropbox_token ?? "null";

  const localToken = JSON.parse(dropbox_token) as TokenResponse | null;
  if (localToken != null) {
    return localToken;
  }

  // : generate state string:
  const stateString = generateStateString();
  setLocalAuthInfo({
    redirect: "dropbox",
    state: stateString,
  })
  // : generate authorization url
  const authUrl = getImplicitAuthorizationUrl({
    authEp: "https://www.dropbox.com/oauth2/authorize",
    clientId: "17wgnjkqr3zs4sa",
    redirectUri: `${location.origin}/redirect`,
    scopes: ["files.content.write", "files.content.read"],
    state: stateString,
  });
  // : open window with this authUrl and wait for return url
  location.href = authUrl;
  return null;
};
