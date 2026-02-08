import packageJson from "../../../../package.json";
import "../../../host-bridge/src/tauriBridge/index";

export const environment = {
  production: true,
  assetFolder: `./assets`,
  version: packageJson.version,
};
