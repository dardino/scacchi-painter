import { spawn, spawnSync } from "node:child_process";
import { createInterface } from "node:readline";

const modes = {
  web: ["api-watch", "api-host", "angular", "swa"],
  api: ["api-watch", "api-host"],
  angular: ["angular"],
  swa: ["swa"]
};

const commands = {
  "api-watch": {
    label: "api:watch",
    color: "\u001b[36m",
    cwd: "Gui/sp-gui-angular/api",
    command: "pnpm",
    args: ["watch"],
    required: "pnpm"
  },
  "api-host": {
    label: "api:host",
    color: "\u001b[33m",
    cwd: "Gui/sp-gui-angular/api",
    command: "func",
    args: ["start"],
    required: "func"
  },
  angular: {
    label: "angular",
    color: "\u001b[32m",
    cwd: "Gui/sp-gui-angular",
    command: "pnpm",
    args: ["start"],
    required: "pnpm"
  },
  swa: {
    label: "swa",
    color: "\u001b[35m",
    cwd: "Gui/sp-gui-angular",
    command: "swa",
    args: ["start", "https://localhost:4200/", "--ssl", "--api-devserver-url", "http://localhost:7071"],
    required: "swa"
  }
};

const resetColor = "\u001b[0m";
const cliArgs = process.argv.slice(2).filter((arg) => arg !== "--");
const requestedMode = cliArgs[0] ?? "web";

if (requestedMode === "--help" || requestedMode === "-h") {
  printHelp();
  process.exit(0);
}

if (!(requestedMode in modes)) {
  console.error(`Unknown mode: ${requestedMode}`);
  printHelp();
  process.exit(1);
}

const selectedCommands = modes[requestedMode].map((key) => commands[key]);
const missingTools = findMissingTools(selectedCommands);

if (missingTools.length > 0) {
  console.error("Missing required tools:");
  for (const tool of missingTools) {
    console.error(`- ${tool.name}: ${tool.hint}`);
  }
  process.exit(1);
}

const children = [];
let shuttingDown = false;
let exitCode = 0;

for (const definition of selectedCommands) {
  children.push(startProcess(definition));
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => shutdown(0, signal));
}

process.on("exit", () => {
  if (!shuttingDown) {
    terminateChildren("SIGTERM");
  }
});

function printHelp() {
  console.log("Usage: node ./scripts/dev-runner.mjs <mode>");
  console.log("");
  console.log("Modes:");
  console.log("  web      Start the full local web stack (default)");
  console.log("  api      Start Azure Functions watch and host");
  console.log("  angular  Start only the Angular dev server");
  console.log("  swa      Start only the Static Web Apps emulator");
}

function resolveCommand(command) {
  return process.platform === "win32" ? `${command}.cmd` : command;
}

function findMissingTools(definitions) {
  const hints = {
    pnpm: "Install pnpm and ensure it is available in PATH.",
    func: "Install Azure Functions Core Tools and ensure `func` is available in PATH.",
    swa: "Install Azure Static Web Apps CLI and ensure `swa` is available in PATH."
  };

  const requiredTools = [...new Set(definitions.map((definition) => definition.required))];
  return requiredTools
    .filter((tool) => !isToolAvailable(tool))
    .map((tool) => ({ name: tool, hint: hints[tool] ?? "Ensure the command is available in PATH." }));
}

function isToolAvailable(tool) {
  const result = spawnSync(resolveCommand(tool), ["--version"], {
    stdio: "ignore",
    shell: false
  });
  return !result.error;
}

function startProcess(definition) {
  const child = spawn(resolveCommand(definition.command), definition.args, {
    cwd: definition.cwd,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
    shell: false
  });

  attachLogger(child.stdout, definition, false);
  attachLogger(child.stderr, definition, true);

  child.on("error", (error) => {
    logLine(definition, `Failed to start: ${error.message}`, true);
    shutdown(1, definition.label);
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    if (code === 0) {
      logLine(definition, "Process exited normally.");
      return;
    }

    const reason = signal ? `signal ${signal}` : `exit code ${code ?? 1}`;
    logLine(definition, `Process stopped with ${reason}.`, true);
    shutdown(code ?? 1, definition.label);
  });

  return child;
}

function attachLogger(stream, definition, isError) {
  if (!stream) {
    return;
  }

  const reader = createInterface({ input: stream });
  reader.on("line", (line) => {
    if (line.length > 0) {
      logLine(definition, line, isError);
    }
  });
}

function logLine(definition, line, isError = false) {
  const prefix = `${definition.color}[${definition.label}]${resetColor}`;
  const target = isError ? process.stderr : process.stdout;
  target.write(`${prefix} ${line}\n`);
}

function shutdown(code, source) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  exitCode = code;
  if (source) {
    process.stderr.write(`Stopping dev runner after ${source}.\n`);
  }

  terminateChildren("SIGTERM");
  setTimeout(() => terminateChildren("SIGKILL"), 1_500).unref();
  setTimeout(() => process.exit(exitCode), 1_700).unref();
}

function terminateChildren(signal) {
  for (const child of children) {
    if (!child.killed) {
      try {
        child.kill(signal);
      } catch {
        // Ignore shutdown errors for already-closed children.
      }
    }
  }
}
