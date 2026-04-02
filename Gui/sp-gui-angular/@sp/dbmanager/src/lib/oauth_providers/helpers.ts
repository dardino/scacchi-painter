export const HASHES = [
  "dropbox",
  "onedrive",
  "null",
] as const;

export type HASHES = typeof HASHES[number];

export interface LocalAuthInfo {
  redirect?: HASHES;
  state?: string;
  dropbox_token?: string;
  onedrive_token?: string;
  return_url?: string;
}

export function getLocalAuthInfo(): Required<LocalAuthInfo> {
  return {
    redirect: (localStorage.getItem("redirect") ?? "null") as HASHES,
    state: localStorage.getItem("state") ?? "",
    dropbox_token: localStorage.getItem("dropbox_token") ?? "null",
    onedrive_token: localStorage.getItem("onedrive_token") ?? "null",
    return_url: localStorage.getItem("return_url") ?? "",
  };
}

export function setLocalAuthInfo(props: LocalAuthInfo) {
  if (hasProp(props, "redirect")) localStorage.setItem("redirect", props.redirect);
  if (hasProp(props, "state")) localStorage.setItem("state", props.state);
  if (hasProp(props, "dropbox_token")) localStorage.setItem("dropbox_token", props.dropbox_token);
  if (hasProp(props, "onedrive_token")) localStorage.setItem("onedrive_token", props.onedrive_token);
  if (hasProp(props, "return_url")) localStorage.setItem("return_url", props.return_url);
}

function hasProp<T extends object, E extends keyof T>(obj: T, prop: E): obj is Required<Pick<T, E>> & Exclude<T, E> {
  return prop in obj;
}
