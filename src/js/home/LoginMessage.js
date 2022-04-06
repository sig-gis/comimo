import React, {useContext} from "react";

import Button from "../components/Button";

import {MainContext} from "../components/PageLayout";

export default function LoginMessage({actionText}) {
  const {localeText: {users}} = useContext(MainContext);
  return (
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
  );
}
