# SpGuiAngular

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

to enable an external phone to access to WSL2 web server:

`netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=4200 connectaddress=172.26.125.244 connectport=4200`

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## To run the app in local

exec in three different terminals:

```sh
#terminal 1
cd api && npm run watch
#terminal 2
cd api && func start

#terminal 3
yarn start

#terminal 4
swa start https://localhost:4200/ --ssl --api-devserver-url http://localhost:7071
```
