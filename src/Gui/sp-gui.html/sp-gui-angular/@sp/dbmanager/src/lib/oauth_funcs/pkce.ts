const charecters = `qwertzuioplkjhgfdsayxcvbnm1234567890YAQWSXCDERFVBGTZHNMJUIKLOP-_.~`;
export function generateStateString(): string {
  let len = 16;
  let generated = "";
  while (len--) {
    const i = Math.floor(Math.random() * charecters.length);
    generated += charecters[i];
  }
  return generated;
}

export function getImplicitAuthorizationUrl({
  auth_ep,
  client_id,
  redirect_uri,
  scopes,
  state,
}: {
  auth_ep: string;
  client_id: string;
  redirect_uri: string;
  scopes: string[];
  state: string;
}): string {
  const authUrl =
    auth_ep +
    `?` +
    `response_type=token` +
    `&client_id=${client_id}` +
    `&redirect_uri=${redirect_uri}` +
    `&scope=${scopes.join("+")}` +
    `&state=${state}`;

  return authUrl;
}

export interface TokenResponse {
  uid: string,
  access_token: string,
  token_type: string,
  state: string,
  scope: string,
  account_id: string,
}
