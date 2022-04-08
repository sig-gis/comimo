import React, {useContext} from "react";
import styled from "styled-components";

import Button from "./Button";

import {titleCase} from "../utils";
import {MainContext} from "./PageLayout";

const CardOuter = styled.div`
  border: 1px solid rgb(0, 0, 0, 0.9);
  border-radius: 6px;
  box-shadow: 0 0 3px 1px rgb(0, 0, 0, 0.5);
  margin-bottom: .5rem;
  padding: .5rem;
`;

const Title = styled.h3`
  text-align: center;
  margin: 0;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
`;

export default function ProjectCard({project: {dataLayer, createdDate, id, name, regions}, onClick}) {
  const {localeText: {validate}} = useContext(MainContext);

  return (
    <CardOuter>
      <Info>
        <Title>{name}</Title>
        <span>{`${validate.predictionLabel}: ${dataLayer}`}</span>
        <span>{`${validate.createdLabel}: ${createdDate}`}</span>
        <span>{`${validate.regionsLabel}:`}
          <ul>
            {regions
              .map(x => x.toUpperCase().split("_"))
              .map(x => <li key={x}>{`${titleCase(x[2])}, ${titleCase(x[1])}`}</li>)}
          </ul>
        </span>
      </Info>
      <ButtonRow>
        <Button
          onClick={() => onClick(id)}
          title={"Close " + name}
        >
        Close
        </Button>
      </ButtonRow>
    </CardOuter>
  );
}
