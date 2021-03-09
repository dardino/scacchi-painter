const charecters = `qwertzuioplkjhgfdsayxcvbnm1234567890YAQWSXCDERFVBGTZHNMJUIKLOP-_.~`;
export const generateStateString = (): string => {
  let len = 16;
  let generated = '';
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
  const authUrl =
    authEp +
    `?` +
    `response_type=token` +
    `&client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&scope=${scopes.join('+')}` +
    `&state=${state}`;

  return authUrl;
};

export interface TokenResponse {
  uid: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  access_token: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  token_type: string;
  state: string;
  scope: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  account_id: string;
}
