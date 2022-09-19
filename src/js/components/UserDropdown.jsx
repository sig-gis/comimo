import React, { useState } from "react";
import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";

import IconTextButton from "./IconTextButton";
import DropDownMenu from "./DropDownMenu";

export default function UserDropdown({ username }) {
  const [show, setShow] = useState(false);
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
  };

  const onClickUserDropdown = (page) => {
    window.location.assign(page);
    setShow(false);
  };

  return (
    <div>
      <IconTextButton
        active={show}
        extraStyle={{ marginRight: "20px" }}
        hasBackground={false}
        icon="user"
        iconSize="26px"
        onClick={() => setShow(!show)}
        text={username}
      />
      <DropDownMenu active={show} options={options} optionOnClick={onClickUserDropdown} />
    </div>
  );
}
