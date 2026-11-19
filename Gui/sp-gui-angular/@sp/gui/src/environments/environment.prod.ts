import packageJson from "../../../../package.json";

export const environment = {
  production: true,
  tauri: false,
  assetFolder: `./assets`,
  version: packageJson.version,
};
