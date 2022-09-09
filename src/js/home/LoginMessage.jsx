import React from "react";
import { useTranslation } from "react-i18next";

import Button from "../components/Button";


export default function LoginMessage({ actionText }) {
  const { i18n, t } = useTranslation()

  return (
    <div style={{ textAlign: "center", width: "100%" }}>
      <p>{`${t("users.toView")} ${actionText}.`}</p>
      <Button
        onClick={() => {
          location.href = "login";
        }}
      >
        {t("users.login")}
      </Button>
    </div>
  );
}
