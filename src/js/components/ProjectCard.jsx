import React, { useContext } from "react";
import styled from "@emotion/styled";

import Button from "./Button";

import { titleCase } from "../utils";
import { MainContext } from "./PageLayout";
import { useTranslation } from "react-i18next";

const CardOuter = styled.div`
  border: 1px solid rgb(0, 0, 0, 0.9);
  border-radius: 6px;
  box-shadow: 0 0 3px 1px rgb(0, 0, 0, 0.5);
  margin-bottom: 0.5rem;
  padding: 0.5rem;
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

export default function ProjectCard({
  project: { dataLayer, createdDate, id, name, regions },
  closeProject,
}) {
  const { t, i18n } = useTranslation();

  return (
    <CardOuter>
      <Info>
        <Title href={`/collect?projectId=${id}`}>{name}</Title>
        <div>{`${t("validate.predictionLabel")}: ${dataLayer}`}</div>
        <div>{`${t("validate.createdLabel")}: ${createdDate}`}</div>
        <div>
          {`${t("validate.regionsLabel")}:`}
          <RegionsList>
            {regions
              .map((x) => x.toUpperCase().split("_"))
              .map((x) => (
                <li key={x}>{`${titleCase(x[2])}, ${titleCase(x[1])}`}</li>
              ))}
          </RegionsList>
        </div>
      </Info>
      <ButtonRow>
        <Button onClick={() => closeProject(id)} tooltip={"Close " + name}>
          Close
        </Button>
      </ButtonRow>
    </CardOuter>
  );
}
