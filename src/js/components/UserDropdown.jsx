import React from "react";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import IconTextButton from "./IconTextButton";
import DropDownMenu from "./DropDownMenu";
import { activeDropDownMenuAtom } from "./PageLayout";

export default function UserDropdown({ username }) {
  const [activeDropdownMenu, setActiveDropdownMenu] = useAtom(activeDropDownMenuAtom);
  const { t } = useTranslation();

  const options = {
    settings: {
      icon: "settings",
      value: "/user-account",
      text: t("users.settings"),
    },
    admin: {
      icon: "admin",
      value: "/admin",
      text: t("users.admin"),
    },
    logout: {
      icon: "logout",
      value: "/logout",
      text: t("users.logout"),
    },
  };

  const onClickUserDropdown = (page) => {
    window.location.assign(page);
    setActiveDropdownMenu(null);
  };

  return (
    <div>
      <IconTextButton
        active={activeDropdownMenu === "user"}
        hasBackground={false}
        icon="user"
        iconSize="26px"
        onClick={(e) => {
          setActiveDropdownMenu("user");
          e.stopPropagation();
        }}
        text={username}
      />
      <DropDownMenu
        active={activeDropdownMenu === "user"}
        options={options}
        optionOnClick={onClickUserDropdown}
        setActiveDropdownMenu={setActiveDropdownMenu}
      />
    </div>
  );
}
