const charecters
  = "qwertzuioplkjhgfdsayxcvbnm1234567890YAQWSXCDERFVBGTZHNMJUIKLOP";
export const generateStateString = (): string => {
  let len = 16;
  let generated = "";
  while (len--) {
    const i = Math.floor(Math.random() * charecters.length);
    generated += charecters[i];
  }
  return generated;
};

export const getImplicitAuthorizationUrl = ({
  authEp,
  clientId,
  redirectUri,
  scopes,
  state,
}: {
  authEp: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  state: string;
}): string => {
  const authUrl
    = authEp
      + "?"
      + "response_type=token"
      + `&client_id=${clientId}`
      + `&redirect_uri=${redirectUri}`
      + `&scope=${scopes.join("+")}`
      + `&state=${state}`;

  return authUrl;
};

export interface TokenResponse {
  uid: string;
  access_token: string;
  token_type: string;
  state: string;
  scope: string;
  account_id: string;
}
