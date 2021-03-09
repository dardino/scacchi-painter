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
  // : generate authorization url
  const authUrl = getImplicitAuthorizationUrl({
    authEp: "https://www.dropbox.com/oauth2/authorize",
    clientId: "17wgnjkqr3zs4sa",
    redirectUri: `${location.origin}/redirect`,
    scopes: ["files.content.write", "files.content.read"],
    state: stateString,
  });
  // : open window with this authUrl and wait for return url
  const w = window.open(authUrl, "_blank");
  if (!w) throw new Error("unable to open window for login access");

  const promise = new Promise<TokenResponse | null>((resolve, reject) => {
    const onMessage = (ev: MessageEvent<TokenResponse>) => {
      destroy();
      if (ev.origin !== location.origin) {
        reject(ev.data);
      } else {
        setTimeout(() => {
          resolve(ev.data);
        }, 200);
      }
    };
    const onClose = () => {
      destroy();
      resolve(null);
    };
    window.addEventListener("message", onMessage);
    w?.addEventListener("close", onClose);

    const destroy = () => {
      window.removeEventListener("message", onMessage);
      w?.removeEventListener("close", onClose);
    };
  });
  const code = await promise;
  w.close();

  if (!code) return null;
  localStorage.setItem("dropbox_token", JSON.stringify(code));
  return code;
};
