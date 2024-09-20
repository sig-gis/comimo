const getCssColorVar = (v) => getComputedStyle(document.body).getPropertyValue(v);

export const THEME = {
  default: {
    standardButton: {
      backgroundColor: "var(--orange-4)",
      borderColor: "var(--black)",
      fillColor: "var(--black)",
    },
    secondaryButton: {
      backgroundColor: "var(--gray-2)",
      borderColor: "var(--white)",
      fillColor: "var(--white)",
    },
    iconButton: {
      backgroundColor: "var(--white)",
      borderColor: "var(--orange-2)",
      fillColor: "var(--gray-1)",
    },
  },
  hover: {
    standardButton: {
      backgroundColor: "var(--gray-2)",
      borderColor: "var(--white)",
      fillColor: "var(--white)",
    },
    secondaryButton: {
      backgroundColor: "var(--orange-4)",
      borderColor: "var(--black)",
      fillColor: "var(--black)",
    },
    iconButton: {
      backgroundColor: "var(--orange-2)",
      borderColor: "var(--white)",
      fillColor: "var(--gray-1)",
    },
  },
  active: {
    standardButton: {
      backgroundColor: "var(--gray-2)",
      borderColor: "var(--white)",
      fillColor: "var(--white)",
    },
    secondaryButton: {
      backgroundColor: "var(--orange-4)",
      borderColor: "var(--black)",
      fillColor: "var(--black)",
    },
    iconButton: {
      backgroundColor: "var(--orange-2)",
      borderColor: "var(--white)",
      fillColor: "var(--gray-1)",
    },
  },
  disabled: {
    backgroundColor: "var(--white)",
    borderColor: "var(--gray-3)",
    fillColor: "var(--gray-3)",
  },
  error: {
    backgroundColor: "var(--white)",
    borderColor: "var(--error-red)",
    fillColor: "var(--error-red)",
  },
  mina: {
    background: getCssColorVar("--mina"), // red
    color: "#eee",
  },
  noMina: {
    background: getCssColorVar("--no-mina"), // gray
    color: "#eee",
  },
  map: {
    boundary: "#ffff7b", // yellow
    unanswered: getCssColorVar("--unanswered"), // blue
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

export const miningLayers = ["cMines", "nMines", "pMines"];

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
  "licensedMining",
  "NICFI",
];

export const layerColors = {
  cMines: "#800080",
  nMines: "#FF0000",
  pMines: "#FFA500",
  municipalBounds: "#E2615B",
  legalMines: "#ECEE0D",
  otherAuthorizations: "#094876",
  tierrasDeCom: "#EDD18F",
  resguardos: "#DB99DB",
  protectedAreas: "#30CE97",
  licensedMining: "#86CAFF",
  NICFI: "#159ebf",
};

export const startVisible = ["cMines", "NICFI"];

export const attributions = {
  NICFI:
    '<a target="_top" rel="noopener" href="https://www.planet.com/nicfi/">Imagery ©2021 Planet Labs Inc</a>. <a target="_top" rel="noopener" href="https://assets.planet.com/docs/Planet_ParticipantLicenseAgreement_NICFI.pdf">All use subject to the Participant License Agreement</a>',
};
