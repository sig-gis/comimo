export const THEME = {
  buttonDisabled: {
    backgroundColor: "var(--white)",
    borderColor: "var(--gray-3)",
    fillColor: "var(--gray-3)",
  },
  primaryButtonDefault: {
    backgroundColor: "var(--orange-4)",
    borderColor: "var(--black)",
    fillColor: "var(--black)",
  },
  primaryButtonHover: {
    backgroundColor: "var(--gray-2)",
    borderColor: "var(--white)",
    fillColor: "var(--white)",
  },
  primaryButtonSelected: {
    backgroundColor: "var(--gray-2)",
    borderColor: "var(--white)",
    fillColor: "var(--white)",
  },
  secondaryButtonDefault: {
    backgroundColor: "var(--gray-2)",
    borderColor: "var(--white)",
    fillColor: "var(--white)",
  },
  secondaryButtonHover: {
    backgroundColor: "var(--orange-4)",
    borderColor: "var(--black)",
    fillColor: "var(--black)",
  },
  secondaryButtonSelected: {
    backgroundColor: "var(--orange-4)",
    borderColor: "var(--black)",
    fillColor: "var(--black)",
  },
  iconButtonDefault: {
    backgroundColor: "var(--white)",
    borderColor: "var(--orange-2)",
    fillColor: "var(--gray-1)",
  },
  iconButtonHover: {
    backgroundColor: "var(--orange-2)",
    borderColor: "var(--white)",
    fillColor: "var(--gray-1)",
  },
  iconButtonSelected: {
    backgroundColor: "var(--orange-2)",
    borderColor: "var(--white)",
    fillColor: "var(--gray-1)",
  },
  disabled: {
    background: "#f8f8f8",
    color: "#999",
  },
  primary: {
    background: "#f8b556",
    color: "#eee",
  },
  mina: {
    background: "#ff6654", // red
    color: "#eee",
  },
  noMina: {
    background: "#00dca0", // green
    color: "#eee",
  },
  map: {
    boundary: "#ffff7b", // yellow
    unanswered: "#8175d2", // blue
  },
};

export const URLS = {
  ADD_SUBS: "add-subscription",
  AREA_STATS: "get-stats-by-region",
  AREA_TOTAL_STATS: "get-stat-totals",
  CLOSE_PROJ: "close-project",
  DEL_SUBS: "remove-subscription",
  DATA_DATES: "get-data-dates",
  CREATE_PROJ: "create-project",
  FEATURE_NAMES: "get-feature-names",
  GET_IMAGE_URL: "get-image-url",
  GET_DL_URL: "get-download-url",
  GET_INFO: "get-info",
  IMG_DATES: "get-image-names",
  LOGS: "get-log-list",
  NICFI_DATES: "get-nicfi-dates",
  MAPQUEST: "https://open.mapquestapi.com/geocoding/v1/address",
  PROJ_DATA: "get-project-by-id",
  PROJ_PLOTS: "get-project-plots",
  PREDICTIONS: "download-predictions",
  REPORT_MINE: "report-mine",
  SAVE_ANSWER: "save-user-answer",
  USER_MINES: "download-user-mines",
  USER_SUBS: "user-subscriptions",
  USER_PROJ: "user-projects",
  USERS: "get-users-list",
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
  "protectedAreas",
  "NICFI",
];

export const startVisible = ["cMines", "NICFI"];

export const attributions = {
  NICFI:
    '<a target="_top" rel="noopener" href="https://www.planet.com/nicfi/">Imagery ©2021 Planet Labs Inc</a>. <a target="_top" rel="noopener" href="https://assets.planet.com/docs/Planet_ParticipantLicenseAgreement_NICFI.pdf">All use subject to the Participant License Agreement</a>',
};
