import { Routes } from "@angular/router";

const getRoutes = <T extends Record<string, Routes[number]>>(e: T): T => e;

export const RoutesList = getRoutes({
  edit: {
    path: "edit/:id",
    loadComponent: () => import("./edit-problem/edit-problem.component").then(m => m.EditProblemComponent),
    pathMatch: "full",
  },
  open: {
    path: "openfile",
    loadComponent: () => import("./open-file/open-file.component").then(m => m.OpenFileComponent),
  },
  openWithSource: {
    path: "openfile/:source",
    loadComponent: () => import("./open-file/open-file.component").then(m => m.OpenFileComponent),
  },
  save: {
    path: "savefile",
    loadComponent: () => import("./save-file/save-file.component").then(m => m.SaveFileComponent),
  },
  list: {
    path: "list",
    loadComponent: () => import("./database-list/database-list.component").then(m => m.DatabaseListComponent),
  },
  redirect: {
    path: "redirect",
    loadComponent: () => import("./auth-redirect/auth-redirect.component").then(m => m.AuthRedirectComponent),
  },
  config: {
    path: "config",
    loadComponent: () => import("./configuration/configuration.component").then(m => m.ConfigurationComponent),
  },
  tournaments: {
    path: "tournaments",
    loadComponent: () => import("./app-tournaments/app-tournaments.component").then(m => m.AppTournamentsComponent),
  },
  home: {
    path: "",
    loadComponent: () => import("./landing/landing.component").then(m => m.LandingComponent),
    pathMatch: "full",
  },
  terms: {
    path: "terms",
    loadComponent: () => import("./privacy-and-terms/privacy-and-terms.component").then(m => m.PrivacyAndTermsComponent),
  },
});
