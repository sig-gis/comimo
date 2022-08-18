import React, { useContext } from "react";

import Button from "../components/Button";

import { MainContext } from "../components/PageLayout";

export default function LoginMessage({ actionText }) {
  const {
    localeText: { users },
  } = useContext(MainContext);
  return (
    <div style={{ textAlign: "center", width: "100%" }}>
      <p>{`${users.toView} ${actionText}.`}</p>
      <Button
        buttonText={users.login}
        clickHandler={() => {
          location.href = "login";
        }}
      />
    </div>
  );
}
