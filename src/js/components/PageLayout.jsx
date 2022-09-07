import React, { useEffect } from "react";
import { atom, useAtom, useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";

import { ThemeProvider } from "@emotion/react";
import AppInfo from "../home/AppInfo";
import Header from "./Header";

import i18n from "../i18n";
import { getLanguage, jsonRequest } from "../utils";
import { THEME } from "../constants";

// TODO: dismiss with escape app info
export const MainContext = React.createContext({});

export const localeTextAtom = atom({});
// export const selectedLanguageAtom = atom(null);

export const myHeightAtom = atom(0);
export const showInfoAtom = atom(false);

export const mapboxTokenAtom = atom("");
export const mapquestKeyAtom = atom("");
export const versionDeployedAtom = atom("");
export const usernameAtom = atom(null);

export function PageLayout({
  role,
  username,
  children,
  mapboxToken,
  mapquestKey,
  versionDeployed,
  showSearch,
}) {
  // const [selectedLanguage, setSelectedLanguage] = useAtom(selectedLanguageAtom);
  const [myHeight, setMyHeight] = useAtom(myHeightAtom);
  const [showInfo, setShowInfo] = useAtom(showInfoAtom);
  const setMapboxToken = useSetAtom(mapboxTokenAtom);
  const setMapquestKey = useSetAtom(mapquestKeyAtom);
  const setVersionDeployed = useSetAtom(versionDeployedAtom);
  const setUsername = useSetAtom(usernameAtom);

  const { t } = useTranslation();

  const isAdmin = role === "admin";

  const updateWindow = () => {
    window.scrollTo(0, 0);
    setMyHeight(window.innerHeight);
  };

  // API Call

  useEffect(() => {
    const getDefaultLang = async () => {
      let resp = await jsonRequest("/user-information");
      i18n.changeLanguage(resp?.defaultLang || "en", (err, t) => {
        if (err) return console.log("something went wrong loading", err);
      });
    };
    getDefaultLang();
    updateWindow();
    window.addEventListener("touchend", updateWindow);
    window.addEventListener("resize", updateWindow);
  }, []);

  useEffect(() => {
    setMapboxToken(mapboxToken);
    setMapquestKey(mapquestKey);
    setVersionDeployed(versionDeployed);
    setUsername(username);
  }, []);

  // TODO we don't need the provider anymore, we should remove it and update all usage of it with useAtom
  return (
    <ThemeProvider theme={THEME}>
      {showInfo && <AppInfo isAdmin={isAdmin} onClose={() => setShowInfo(false)} />}
      <div
        id="root-component"
        style={{
          height: myHeight,
          width: "100%",
          margin: 0,
          padding: 0,
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header
          setShowInfo={setShowInfo}
          showSearch={showSearch}
          username={username}
        />
        {children}
      </div>
    </ThemeProvider>
  );
}

