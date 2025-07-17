import chalk from "chalk";
import childProcess from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

function buildApp(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    console.log(chalk.green("STEP 1: Building Angular APP"));
    try {
      const child = childProcess.spawn("yarn build:tauri", {
        shell: true,
        stdio: "inherit",
        cwd: "../sp-gui-angular",
        env: process.env
      })
      
      child.stdout?.pipe(process.stdout);
      child.stderr?.pipe(process.stderr);
      
      child.on("exit", (code) => {
        if (code === 0) {
          console.log(chalk.green("Build successful!"));
          resolve(true);
        } else {
          console.log(chalk.red("Build failed!"));
          resolve(false);
        }
      })
    } catch (e) {
      reject(e);
    }
  })
}

async function copyPopeyeExecutable() {
  console.log(chalk.green("STEP 2: Copying popeye executable"));
  const url = (await import("./urls.json")).default.popeye;
  await fetch(url)
    .then((response) => response.blob())
    .then(async (blob) => {
      const outPath = path.join(__dirname, "..", "dist", "windows", "pywin64.exe");
      await fs.mkdir(path.dirname(outPath), { recursive: true });
      return await fs.writeFile(outPath, Buffer.from(await blob.arrayBuffer()));
    })
}

buildApp()
  .then((ok) => {
    if (ok) {
      copyPopeyeExecutable();
    }
  }).catch(console.error);
