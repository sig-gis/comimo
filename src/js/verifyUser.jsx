import React, { Suspense, useEffect } from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import { ThemeProvider } from "@emotion/react";

import AccountForm from "./components/AccountForm";

import i18n from "./i18n"; // to init localization...
import { jsonRequest } from "./utils";
import { THEME } from "./constants";

function VerifyUser({ token, email }) {
  const { t } = useTranslation();

  useEffect(() => {
    const verifyEmail = async () => {
      const res = await jsonRequest("/verify-email", {
        token,
        email,
      });
      if (res === "") {
        alert(t("users.verified"));
        window.location = "/login";
      } else {
        console.error(res);
        console.log("error, ", res);
        console.log("translation, ", `users.${res}`);
        alert(t(`users.${res}`) || t("users.errorCreating"));
        window.location = "/password-request";
      }
    };

    verifyEmail().catch(console.error);
  }, []);

  return (
    <ThemeProvider theme={THEME}>
      <AccountForm header={t("users.verifyUser")}>
        <label>{t("users.verifying")}...</label>
      </AccountForm>
    </ThemeProvider>
  );
}

export function pageInit(args, session) {
  ReactDOM.render(
    <Suspense fallback="">
      <VerifyUser email={args.email || ""} token={args.token || ""} />
    </Suspense>,
    document.getElementById("app")
  );
}
