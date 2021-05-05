import React from "react";

import {MainContext} from "./context";

export default function LoginMessage({actionText}) {
    return (
        <MainContext.Consumer>
            {({localeText: {login}}) => (
                <div style={{textAlign: "center", width: "100%"}}>
                    <p>{`${login.toView} ${actionText}.`}</p>
                    <button
                        className="map-upd-btn"
                        onClick={() => {
                            location.href = "accounts/login";
                        }}
                        type="button"
                    >
                        {login.login}
                    </button>
                </div>
            )}
        </MainContext.Consumer>
    );
}
