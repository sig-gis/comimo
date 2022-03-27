import React, {useContext} from "react";

import Button from "./Button";

import {MainContext} from "../home/constants";
import {titleCase} from "../utils";

export default function ProjectCard({project: {dataLayer, createdDate, id, name, regions}, onClick}) {
  const {localeText: {validate}} = useContext(MainContext);

  return (
    <li key={id} style={{display: "flex", flexDirection: "row", alignItems: "flex-end"}}>
      <div style={{display: "flex", flexGrow: 4, flexDirection: "column"}}>
        <label style={{alignSelf: "center"}}>{name}</label>
        <small>{`${validate.predictionLabel}: ${dataLayer}`}</small>
        <small>{`${validate.createdLabel}: ${createdDate}`}</small>
        <small>{`${validate.regionsLabel}:`}
          <ul>
            {regions
              .map(x => x.toUpperCase().split("_"))
              .map(x => <li key={x}>{`${titleCase(x[2])}, ${titleCase(x[1])}`}</li>)}
          </ul>
        </small>
      </div>
      <Button
        onClick={() => onClick(id)}
        style={{height:"2rem"}}
        title={"Close " + name}
      >
        Close
      </Button>
    </li>
  );
}
