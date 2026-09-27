import { Injectable } from "@angular/core";
import { localStoredSignal } from "./signalFactories/localStored";

@Injectable({
  providedIn: "root",
})
export class LogService {
  #logs = localStoredSignal<{ log: string[] }, "log">("log", []);

  log(...message: (string | number | boolean | null | undefined)[]) {
    const timestamp = new Date().toISOString();
    const realMessage = `[${timestamp}] ${message}`;
    // eslint-disable-next-line no-console
    console.log(realMessage);
    this.#logs.set([realMessage, ...this.Logs().slice(0, 499)]);
  }

  error = (message: string) => { this.log(`ERROR: ${message}`); };
  info = (message: string) => { this.log(` INFO: ${message}`); };
  debug = (message: string) => { this.log(`DEBUG: ${message}`); };
  warn = (message: string) => { this.log(` WARN: ${message}`); };

  clearLogs() {
    this.#logs.set([]);
  }

  downloadLogs() {
    const element = document.createElement("a");
    const file = new Blob([this.Logs().join("\n")], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "log.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  Logs = this.#logs.asReadonly();

  constructor() {}
}
