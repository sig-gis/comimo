import React from "react";

import {MainContext} from "./context";

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
                    <div style={{textAlign: "right"}}>
                        {isAdmin && (
                            <a href="/download" style={{marginRight: "1rem"}}>
                                {appInfo.download}
                            </a>
                        )}
                        <a href="/accounts/logout">{appInfo.logout}</a>
                    </div>
                    <h2 className="heading3">{appInfo.title}</h2>
                    <h3 style={{margin: "1rem 0"}}>{appInfo.termsOfUse}</h3>
                    <p>{appInfo.shortTerms}</p>
                    <a
                        href="https://docs.google.com/document/d/1kJrlXUlyDRVeVEb1WcPOWBNnzJ1s-9spLTHCxnk8o5E"
                        rel="noopener noreferrer"
                        style={{margin: ".5rem 0"}}
                        target="_blank"
                    >
                        {appInfo.viewTerms}
                    </a>
                    <a
                        href="https://docs.google.com/document/d/1kJrlXUlyDRVeVEb1WcPOWBNnzJ1s-9spLTHCxnk8o5E"
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
