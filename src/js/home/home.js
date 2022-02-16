import React from "react";
import ReactDOM from "react-dom";

import PageLayout from "./PageLayout";

export function pageInit(args) {
  ReactDOM.render(
    <PageLayout
      role={args.role}
      userLang={args.userLang}
      username={args.username}
    />,
    document.getElementById("main-container")
  );
}
