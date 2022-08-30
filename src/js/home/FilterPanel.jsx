import React, { useContext, useEffect, useState } from "react";

import ToolCard from "../components/ToolCard";
import Button from "../components/Button";
import Select from "../components/Select";

import { MainContext } from "../components/PageLayout";
import { useSetAtom } from "jotai";

export default function FilterPanel({
  selectedDates,
  isHidden,
  imageDates: { nMines, pMines, cMines },
  selectDates,
  active,
}) {
  const [newSelectedDates, setNewSelectedDates] = useState({});

  const {
    localeText: { filter, layers },
  } = useContext(MainContext);

  const setSelectedDate = (type, date) => {
    setNewSelectedDates({ ...newSelectedDates, [type]: date });
  };

  useEffect(() => {
    setNewSelectedDates(selectedDates);
  }, [isHidden, pMines]);

  return (
    <ToolCard title={filter?.title} active={active}>
      <span htmlFor="select-image-date">{filter?.selectLabel}:</span>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Select
          id="selectcMine"
          label={layers?.cMines}
          onChange={(e) => setSelectedDate("cMines", e.target.value)}
          options={cMines}
          value={newSelectedDates?.cMines}
        />
        <Select
          id="selectnMine"
          label={layers?.nMines}
          onChange={(e) => setSelectedDate("nMines", e.target.value)}
          options={nMines}
          value={newSelectedDates?.nMines}
        />
        <Select
          id="selectpMine"
          label={layers?.pMines}
          onChange={(e) => setSelectedDate("pMines", e.target.value)}
          options={pMines}
          value={newSelectedDates?.pMines}
        />
        <Button onClick={() => selectDates(newSelectedDates)} extraStyle={{ marginTop: "1rem" }}>
          {filter?.updateMap}
        </Button>
      </div>
    </ToolCard>
  );
}
