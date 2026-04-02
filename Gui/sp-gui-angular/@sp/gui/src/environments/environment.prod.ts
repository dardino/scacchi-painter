import packageJson from "../../../../package.json";

export const environment = {
  production: true,
  assetFolder: `./assets`,
  version: packageJson.version,
};
