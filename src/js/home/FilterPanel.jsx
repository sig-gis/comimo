import React from "react";

import ToolPanel from "../components/ToolPanel";
import Button from "../components/Button";
import Select from "../components/Select";

import { MainContext } from "../components/PageLayout";

export default class FilterPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newSelectedDates: {},
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      (prevProps.isHidden && !this.props.isHidden) ||
      (!prevProps.imageDates.pMines && this.props.imageDates.pMines)
    ) {
      this.setState({ newSelectedDates: this.props.selectedDates });
    }
  }

  setSelectedDate = (type, date) => {
    this.setState({ newSelectedDates: { ...this.state.newSelectedDates, [type]: date } });
  };

  render() {
    const {
      selectDates,
      imageDates: { nMines, pMines, cMines },
    } = this.props;
    const { newSelectedDates } = this.state;
    const {
      localeText: { filter, layers },
    } = this.context;
    return (
      <ToolPanel title={filter.title}>
        <span htmlFor="select-image-date">{filter.selectLabel}:</span>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Select
            id="selectcMine"
            label={layers.cMines}
            onChange={(e) => this.setSelectedDate("cMines", e.target.value)}
            options={cMines}
            value={newSelectedDates.cMines}
          />
          <Select
            id="selectnMine"
            label={layers.nMines}
            onChange={(e) => this.setSelectedDate("nMines", e.target.value)}
            options={nMines}
            value={newSelectedDates.nMines}
          />
          <Select
            id="selectpMine"
            label={layers.pMines}
            onChange={(e) => this.setSelectedDate("pMines", e.target.value)}
            options={pMines}
            value={newSelectedDates.pMines}
          />
          <Button
            buttonText={filter.updateMap}
            clickHandler={() => selectDates(newSelectedDates)}
            extraStyle={{ marginTop: "1rem" }}
          />
        </div>
      </ToolPanel>
    );
  }
}
FilterPanel.contextType = MainContext;
