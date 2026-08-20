import packageJson from "../../../../package.json";
import "../bridges/tauri/tauri.bridge";

export const environment = {
  production: true,
  assetFolder: `./assets`,
  version: packageJson.version,
};
