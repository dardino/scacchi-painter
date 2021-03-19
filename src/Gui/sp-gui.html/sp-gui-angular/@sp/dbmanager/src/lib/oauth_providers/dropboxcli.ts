import {
  generateStateString,
  getImplicitAuthorizationUrl,
  TokenResponse,
} from "../oauth_funcs/pkce";

export const getDropboxToken = async (): Promise<TokenResponse | null> => {
  const localToken = JSON.parse(
    localStorage.getItem("dropbox_token") ?? "null"
  ) as TokenResponse | null;
  if (localToken != null) {
    return localToken;
  }

  // : generate state string:
  const stateString = generateStateString();
  localStorage.setItem("state", stateString);
  localStorage.setItem("redirect", location.href + "#dropbox");
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
