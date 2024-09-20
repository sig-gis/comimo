import React, { useEffect } from "react";
import { atom, useAtom, useSetAtom, useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";

import { ThemeProvider } from "@emotion/react";
import AppInfo from "../home/AppInfo";
import Header from "./Header";

import i18n from "../i18n";
import { jsonRequest } from "../utils";
import { THEME } from "../constants";
import { homeMapAtom } from "../home/HomeMap";
import { collectMapAtom } from "../collect/CollectMap";

export const myHeightAtom = atom(0);
export const showInfoAtom = atom(false);
export const mapboxTokenAtom = atom("");
export const versionDeployedAtom = atom("");
export const usernameAtom = atom(null);
export const visibleDropdownMenuAtom = atom(null);
export const activeDropDownMenuAtom = atom(
  (get) => get(visibleDropdownMenuAtom),
  (get, set, menuKey) => {
    set(visibleDropdownMenuAtom, menuKey === get(visibleDropdownMenuAtom) ? null : menuKey);
  }
);

// TODO: remove me after refactoring collect
export const MainContext = React.createContext({});

export function PageLayout({
  role,
  username,
  children,
  mapboxToken,
  theMap,
  versionDeployed,
  showSearch,
}) {
  const homeMap = useAtomValue(homeMapAtom);
  const collectMap = useAtomValue(collectMapAtom);
  const [myHeight, setMyHeight] = useAtom(myHeightAtom);
  const [showInfo, setShowInfo] = useAtom(showInfoAtom);
  const setMapboxToken = useSetAtom(mapboxTokenAtom);
  const setVersionDeployed = useSetAtom(versionDeployedAtom);
  const setUsername = useSetAtom(usernameAtom);
  const [activeDropDownMenu, setActiveDropDownMenu] = useAtom(activeDropDownMenuAtom);

  const { t } = useTranslation();

  const isAdmin = role === "admin";

  const updateWindow = () => {
    window.scrollTo(0, 0);
    setMyHeight(window.innerHeight);
  };

  // API Call

  useEffect(() => {
    const handleClick = (e) => {
      if (activeDropDownMenu) {
        setActiveDropDownMenu(null);
      }
    };

    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [activeDropDownMenu]);

  useEffect(() => {
    const getDefaultLang = async () => {
      const resp = await jsonRequest("/user-information").catch(console.error);
      i18n.changeLanguage(resp?.defaultLang || "es", (err, t) => {
        if (err) return console.log("something went wrong loading", err);
      });
    };
    if (username) {
      getDefaultLang();
    } else {
      i18n.changeLanguage("es");
    }
    updateWindow();
    window.addEventListener("touchend", updateWindow);
    window.addEventListener("resize", updateWindow);
  }, []);

  useEffect(() => {
    setMapboxToken(mapboxToken);
    setVersionDeployed(versionDeployed);
    setUsername(username);
  }, []);

  return (
    <ThemeProvider theme={THEME}>
      {showInfo && <AppInfo onClose={() => setShowInfo(false)} />}
      <div
        id="root-component"
        style={{
          height: myHeight,
          width: "100%",
          margin: 0,
          overflow: "hidden",
          padding: 0,
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header
          showSearch={showSearch}
          theMap={theMap === "homeMap" ? homeMap : collectMap}
          username={username}
        />
        {children}
      </div>
    </ThemeProvider>
  );
}
