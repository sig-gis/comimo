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

// export const selectLanguage = async (newLang, setSelectedLanguage, setLocaleText) => {
//   console.log("Setting it to...", newLang);
//   setSelectedLanguage(newLang);
//   setLocaleText(await jsonRequest(`/locale/${newLang}.json`, null, "GET").catch(console.error));
// };

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
  // const [selectedLanguage, setSelectedLanguage] = useAtom(selectedLanguageAtom);
  const [myHeight, setMyHeight] = useAtom(myHeightAtom);
  const [showInfo, setShowInfo] = useAtom(showInfoAtom);
  const setMapboxToken = useSetAtom(mapboxTokenAtom);
  const setMapquestKey = useSetAtom(mapquestKeyAtom);
  const setVersionDeployed = useSetAtom(versionDeployedAtom);
  const setUsername = useSetAtom(usernameAtom);

  // const { t, i18n } = useTranslation();

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
    console.log("userlang", userLang);
    // if (username && ["en", "es"].includes(userLang)) {
    //   i18n.changeLanguage(userLang, (err, t) => {
    //     if (err) return console.log("something went wrong loading", err);
    //   });
    // }
    updateWindow();
    window.addEventListener("touchend", updateWindow);
    window.addEventListener("resize", updateWindow);
  }, [userLang]);

  // useEffect(() => {
  //   if (selectedLanguage) i18n.selectLanguage(homeLanguage);
  //   updateWindow();
  //   window.addEventListener("touchend", updateWindow);
  //   window.addEventListener("resize", updateWindow);
  // }, [selectedLanguage]);

  useEffect(() => {
    setMapboxToken(mapboxToken);
    setMapquestKey(mapquestKey);
    setVersionDeployed(versionDeployed);
    setUsername(username);
  }, []);

  // const { myHeight, showInfo, localeText, selectedLanguage } = this.state;

  // TODO we don't need the provider anymore, we should remove it and update all usage of it with useAtom
  return (
    <MainContext.Provider
      value={{
        username, // TODO delete
        isAdmin, // TODO delete
        localeText, // TODO delete
        myHeight, // TODO delete
        setShowInfo, // TODO delete
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
            // selectedLanguage={selectedLanguage}
            // selectLanguage={(newLang) => setSelectedLanguage(newLang)}
            setShowInfo={setShowInfo}
            showSearch={showSearch}
            username={username}
          />
          {children}
        </div>
      </ThemeProvider>
    </MainContext.Provider>
  );
}
