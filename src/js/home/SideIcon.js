import React from "react";

import SvgIcon from "../components/SvgIcon";

export default function SideIcon({parentClass, clickHandler, tooltip, icon, subtext, active}) {
  return (
    <button
      className={`sidebar-icon ${(parentClass || "")} ${active ? "active-icon" : ""}`}
      onClick={clickHandler}
      title={tooltip}
      type="button"
    >
      <div style={{padding: "6px", display: "flex", justifyContent: "center"}}>
        <SvgIcon color="#003333" icon={icon} size="38px"/>
      </div>
      {subtext && <span className="advanced-text mb-3">{subtext}</span>}
    </button>
  );
}
