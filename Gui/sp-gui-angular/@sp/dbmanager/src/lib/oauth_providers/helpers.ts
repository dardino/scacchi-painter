export const HASHES = [
  "dropbox",
  "onedrive",
  "googledrive",
  "null",
] as const;

export type HASHES = typeof HASHES[number];

export interface LocalAuthInfo {
  redirect?: HASHES;
  state?: string;
  dropbox_token?: string;
  onedrive_token?: string;
  google_token?: string;
  google_code_verifier?: string;
  return_url?: string;
}

function readSecureValue(key: string): string | null {
  return localStorage.getItem(key) ?? null;
}

function writeSecureValue(key: string, value: string) {
  localStorage.setItem(key, value);
}

export function getLocalAuthInfo(): Required<LocalAuthInfo> {
  return {
    redirect: (readSecureValue("redirect") ?? "null") as HASHES,
    state: readSecureValue("state") ?? "",
    dropbox_token: readSecureValue("dropbox_token") ?? "null",
    onedrive_token: readSecureValue("onedrive_token") ?? "null",
    google_token: readSecureValue("google_token") ?? "null",
    google_code_verifier: readSecureValue("google_code_verifier") ?? "",
    return_url: readSecureValue("return_url") ?? "",
  };
}

export function setLocalAuthInfo(props: LocalAuthInfo) {
  if (hasProp(props, "redirect")) writeSecureValue("redirect", props.redirect);
  if (hasProp(props, "state")) writeSecureValue("state", props.state);
  if (hasProp(props, "dropbox_token")) writeSecureValue("dropbox_token", props.dropbox_token);
  if (hasProp(props, "onedrive_token")) writeSecureValue("onedrive_token", props.onedrive_token);
  if (hasProp(props, "google_token")) writeSecureValue("google_token", props.google_token);
  if (hasProp(props, "google_code_verifier")) writeSecureValue("google_code_verifier", props.google_code_verifier);
  if (hasProp(props, "return_url")) writeSecureValue("return_url", props.return_url);
}

function hasProp<T extends object, E extends keyof T>(obj: T, prop: E): obj is Required<Pick<T, E>> & Exclude<T, E> {
  return prop in obj;
}
