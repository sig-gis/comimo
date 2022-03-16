import React from "react";
import ReactDOM from "react-dom";
import PageLayout from "../components/PageLayout";

class CollectContent extends React.Component {
  render() {
    return <div>Collect</div>;
  }
}

export function pageInit(args) {
  ReactDOM.render(
    <PageLayout
      role={args.role}
      userLang={args.userLang}
      username={args.username}
    >
      <CollectContent/>
    </PageLayout>,
    document.getElementById("main-container")
  );
}
