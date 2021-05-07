import React from "react";

import {MainContext} from "./context";
import SvgIcon from "../SvgIcon";

export default class AppInfo extends React.Component {
  render() {
    const {isHidden, onOuterClick} = this.props;
    const {isAdmin, localeText: {appInfo}} = this.context;
    return (
      <div
        className={"info-modal " + (isHidden ? "see-through" : "")}
        onClick={onOuterClick}
      >
        <div
          className="inner-container"
          onClick={e => e.stopPropagation()}
        >
          <div
            onClick={onOuterClick}
            style={{position: "absolute", top: ".25rem", right: ".25rem"}}
          >
            <SvgIcon color="black" icon="close" size="1.5rem"/>
          </div>
          <div style={{display: "flex", justifyContent: "flex-end", marginBottom: ".5rem"}}>
            {isAdmin && (
              <a href="/download-data" style={{margin: "0 1rem"}}>
                {appInfo.download}
              </a>
            )}
            <a href="/logout">{appInfo.logout}</a>
          </div>
          <h2 className="heading3">{appInfo.title}</h2>
          <h3 style={{margin: "1rem 0"}}>{appInfo.termsOfUse}</h3>
          <p>{appInfo.shortTerms}</p>
          <a
            href={appInfo.termsUrl}
            rel="noopener noreferrer"
            style={{margin: ".5rem 0"}}
            target="_blank"
          >
            {appInfo.viewTerms}
          </a>
          <a
            href={appInfo.instructionsUrl}
            rel="noopener noreferrer"
            style={{margin: ".5rem 0"}}
            target="_blank"
          >
            {appInfo.viewInstructions}
          </a>
        </div>
      </div>
    );
  }
}
AppInfo.contextType = MainContext;
