/* eslint-disable no-console */
import { ApplicationRef, Component, OnInit } from "@angular/core";
import { SwUpdate } from "@angular/service-worker";
import { concat, first, interval } from "rxjs";
import { environment } from "../../environments/environment";

@Component({
    selector: "app-configuration",
    templateUrl: "./configuration.component.html",
    styleUrls: ["./configuration.component.less"],
    
})
export class ConfigurationComponent implements OnInit {
  constructor(
    appRef: ApplicationRef,
    swUpdate: SwUpdate
  ) {

    // CHECK for UPDATES
    const appIsStable$ = appRef.isStable.pipe(first(isStable => isStable === true));
    const everySixHours$ = interval(6 * 60 * 60 * 1000);
    const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);
    if (environment.production) {
      everySixHoursOnceAppIsStable$.subscribe(async () => {
        try {
          const updateFound = await swUpdate.checkForUpdate();
          console.log(updateFound ? 'A new version is available.' : 'Already on the latest version.');
        } catch (err) {
          console.error('Failed to check for updates:', err);
        }
      });

      // subscribe for app updates available
      swUpdate.versionUpdates.subscribe(async (evt) => {
        switch (evt.type) {
          case 'VERSION_DETECTED':
            console.log(`Downloading new app version: ${evt.version.hash}`);
            break;
          case 'VERSION_READY':
            {
              console.log(`Current app version: ${evt.currentVersion.hash}`);
              console.log(`New app version ready for use: ${evt.latestVersion.hash}`);
              const run = confirm(`New app version ready for use: ${evt.latestVersion.hash}\r\nRestart is reqired to load the new version.\r\nWould you like to restart the application now?`);
              if (run) {
                document.location.reload();
              }
            }
            break;
          case 'VERSION_INSTALLATION_FAILED':
            console.log(`Failed to install app version '${evt.version.hash}': ${evt.error}`);
            break;
        }
      });
    }
  }

  version: string;

  ngOnInit(): void {
    this.version = environment.version;
  }

  reload() {
    location.href = "/?" + Math.random();
    location.href = "/";
  }
}
