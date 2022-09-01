import React, { useEffect } from "react";
import { atom, useAtom, useSetAtom } from "jotai";

import { ThemeProvider } from "@emotion/react";
import AppInfo from "../home/AppInfo";
import Header from "./Header";

import { getLanguage, jsonRequest } from "../utils";
import { THEME } from "../constants";

// TODO: dismiss with escape app info
export const MainContext = React.createContext({});

export const localeTextAtom = atom({});
export const selectedLanguageAtom = atom("en");

export const myHeightAtom = atom(0);
export const showInfoAtom = atom(false);

export const mapboxTokenAtom = atom("");
export const mapquestKeyAtom = atom("");
export const versionDeployedAtom = atom("");

// export const textAtom = atom("hello");

// const getLocalText = (lang) => {
//   jsonRequest(`/locale/${lang}.json`, null, "GET")
//     .then((data) => setLocaleText(data))
//     .catch((err) => console.error(err));
// };

// export const localeText2Atom = atom((get) => {
//   jsonRequest(`/locale/${lang}.json`, null, "GET")
//   return get(selectedLanguageAtom).length;
// });

export const selectLanguage = async (newLang, setSelectedLanguage, setLocaleText) => {
  setSelectedLanguage(newLang);
  setLocaleText(await jsonRequest(`/locale/${newLang}.json`, null, "GET").catch(console.error));
};


export function PageLayout({
  role,
  username,
  children,
  userLang,
  mapboxToken,
  mapquestKey,
  versionDeployed,
  showSearch,
}) {
  const [localeText, setLocaleText] = useAtom(localeTextAtom);
  const [selectedLanguage, setSelectedLanguage] = useAtom(selectedLanguageAtom);
  const [myHeight, setMyHeight] = useAtom(myHeightAtom);
  const [showInfo, setShowInfo] = useAtom(showInfoAtom);
  const setMapboxToken = useSetAtom(mapboxTokenAtom);
  const setMapquestKey = useSetAtom(mapquestKeyAtom);
  const setVersionDeployed = useSetAtom(versionDeployedAtom);

  const isAdmin = role === "admin";

  // const selectLanguage = async (newLang, setSelectedLanguage, setLocaleText) => {
  //   setSelectedLanguage(newLang);
  //   setLocaleText(await jsonRequest(`/locale/${newLang}.json`, null, "GET").catch(console.error));
  // };

  const updateWindow = () => {
    window.scrollTo(0, 0);
    setMyHeight(window.innerHeight);
  };

  // API Call

  useEffect(() => {
    setSelectedLanguage(["en", "es"].includes(userLang) ? userLang : getLanguage(["en", "es"]));
  }, []);

  useEffect(() => {
    if (selectedLanguage) selectLanguage(selectedLanguage, setSelectedLanguage, setLocaleText);
    updateWindow();
    window.addEventListener("touchend", updateWindow);
    window.addEventListener("resize", updateWindow);
  }, [selectedLanguage]);

  useEffect(() => {
    setMapboxToken(mapboxToken);
    setMapquestKey(mapquestKey);
    setVersionDeployed(versionDeployed);
  }, []);

  // const { myHeight, showInfo, localeText, selectedLanguage } = this.state;

  // TODO we don't need the provider anymore, we should remove it and update all usage of it with useAtom
  return (
    <MainContext.Provider
      value={{
        isAdmin,
        username,
        localeText,
        myHeight,
        setShowInfo,
      }}
    >
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
            localeText={localeText}
            selectedLanguage={selectedLanguage}
            selectLanguage={(newLang) => setSelectedLanguage(newLang)}
            setShowInfo={setShowInfo}
            showSearch={showSearch}
            username={username}
          />
          <div
            id="page-body"
            style={{
              margin: "0px",
              padding: "0px",
              position: "relative",
              flex: "1",
            }}
          />
          {children}
        </div>
      </ThemeProvider>
    </MainContext.Provider>
  );
}
