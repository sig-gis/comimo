import React, {useContext} from "react";
import styled from "@emotion/styled";

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

const Title = styled.a`
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
  text-align: center;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
`;

const RegionsList = styled.ul`
  margin: 0;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
`;

export default function ProjectCard({project: {dataLayer, createdDate, id, name, regions}, closeProject}) {
  const {localeText: {validate}} = useContext(MainContext);

  return (
    <CardOuter>
      <Info>
        <Title href={`/collect?projectId=${id}`}>{name}</Title>
        <div>{`${validate.predictionLabel}: ${dataLayer}`}</div>
        <div>{`${validate.createdLabel}: ${createdDate}`}</div>
        <div>{`${validate.regionsLabel}:`}
          <RegionsList>
            {regions
              .map(x => x.toUpperCase().split("_"))
              .map(x => <li key={x}>{`${titleCase(x[2])}, ${titleCase(x[1])}`}</li>)}
          </RegionsList>
        </div>
      </Info>
      <ButtonRow>
        <Button
          onClick={() => closeProject(id)}
          title={"Close " + name}
        >
        Close
        </Button>
      </ButtonRow>
    </CardOuter>
  );
}
