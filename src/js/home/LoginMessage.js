import React from "react";

import Button from "../components/Button";

import {MainContext} from "./constants";

export default function LoginMessage({actionText}) {
  return (
    <MainContext.Consumer>
      {({localeText: {users}}) => (
        <div style={{textAlign: "center", width: "100%"}}>
          <p>{`${users.toView} ${actionText}.`}</p>
          <Button
            onClick={() => {
              location.href = "login";
            }}
          >
            {users.login}
          </Button>
        </div>
      )}
    </MainContext.Consumer>
  );
}
