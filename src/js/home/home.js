import React from "react";
import ReactDOM from "react-dom";

import PageLayout from "./PageLayout";

export function pageInit(args) {
    ReactDOM.render(<PageLayout {...args}/>, document.getElementById("main-container"));
}
