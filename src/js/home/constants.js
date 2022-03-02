import React from "react";

export const MainContext = React.createContext();

export const URLS = {
  ADD_SUBS: "add-subscription",
  AREA_STATS: "get-area-predicted",
  AREA_TOTAL_STATS: "get-area-ts",
  CLOSE_PROJ: "close-project",
  DEL_SUBS: "remove-subscription",
  DATA_DATES: "get-data-dates",
  CREATE_PROJ: "create-project",
  FEATURE_NAMES: "get-feature-names",
  GEE_LAYER: "get-gee-tiles",
  GET_DL_URL: "get-download-url",
  GET_INFO: "get-info",
  IMG_DATES: "get-image-names",
  MAPQUEST: "https://open.mapquestapi.com/geocoding/v1/address",
  PREDICTIONS: "download-predictions",
  REPORT_MINE: "report-mine",
  SINGLE_IMAGE: "get-single-image",
  USER_MINES: "download-user-mines",
  USER_SUBS: "user-subscriptions",
  USER_PROJ: "user-projects"
};

export const availableLayers = [
  "cMines",
  "nMines",
  "pMines",
  "municipalBounds",
  "legalMines",
  "otherAuthorizations",
  "tierrasDeCom",
  "resguardos",
  "protectedAreas"
];

export const startVisible = [
  "cMines"
];
