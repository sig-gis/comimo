import React from "react";

import {MainContext} from "./context";

export default function LoginMessage({actionText}) {
  return (
    <MainContext.Consumer>
      {({localeText: {users}}) => (
        <div style={{textAlign: "center", width: "100%"}}>
          <p>{`${users.toView} ${actionText}.`}</p>
          <button
            className="map-upd-btn"
            onClick={() => {
              location.href = "login";
            }}
            type="button"
          >
            {users.login}
          </button>
        </div>
      )}
    </MainContext.Consumer>
  );
}
