export const HASHES = [
  "dropbox",
  "onedrive",
  "null"
] as const;

type HASHES = typeof HASHES[number];

export interface LocalAuthInfo {
  redirect?: HASHES;
  state?: string;
  dropbox_token?: string;
  onedrive_token?: string;
}

export function getLocalAuthInfo(): Required<LocalAuthInfo> {
  return {
    redirect: (localStorage.getItem("redirect") ?? "null") as HASHES,
    state: localStorage.getItem("state") ?? "",
    dropbox_token: localStorage.getItem("dropbox_token") ?? "null",
    onedrive_token: localStorage.getItem("onedrive_token") ?? "null",
  }
}

export function setLocalAuthInfo(props: LocalAuthInfo) {
  if (hasProp(props, "redirect")) localStorage.setItem("redirect", props.redirect);
  if (hasProp(props, "state")) localStorage.setItem("state", props.state);
  if (hasProp(props, "dropbox_token")) localStorage.setItem("dropbox_token", props.dropbox_token);
  if (hasProp(props, "onedrive_token")) localStorage.setItem("onedrive_token", props.onedrive_token);
}

function hasProp<T extends object, E extends keyof T>(obj: T, prop: E): obj is Required<Pick<T, E>> & Exclude<T, E> {
  return prop in obj;
}
