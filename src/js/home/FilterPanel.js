import React from "react";

import ToolPanel from "../components/ToolPanel";
import Button from "../components/Button";

import {MainContext} from "./constants";

export default class FilterPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newSelectedDates: {}
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if ((prevProps.isHidden && !this.props.isHidden)
        || (!prevProps.imageDates.pMines && this.props.imageDates.pMines)) {
      this.setState({newSelectedDates: this.props.selectedDates});
    }
  }

  setSelectedDate = (type, date) => {
    this.setState({newSelectedDates: {...this.state.newSelectedDates, [type]: date}});
  };

  render() {
    const {selectDates, imageDates: {nMines, pMines, cMines}} = this.props;
    const {newSelectedDates} = this.state;
    const {localeText: {filter, layers}} = this.context;
    return (
      <ToolPanel title={filter.title}>
        <span htmlFor="select-image-date">{filter.selectLabel}:</span>
        <div style={{display: "flex", flexDirection: "column"}}>
          <label htmlFor="select-image-date">{layers.cMines}</label>
          <select
            id="select-image-date"
            onChange={e => this.setSelectedDate("cMines", e.target.value)}
            value={newSelectedDates.cMines}
          >
            {(cMines || []).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <label htmlFor="select-image-date">{layers.nMines}</label>
          <select
            id="select-image-date"
            onChange={e => this.setSelectedDate("nMines", e.target.value)}
            value={newSelectedDates.nMines}
          >
            {(nMines || []).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <label htmlFor="select-image-date">{layers.pMines}</label>
          <select
            id="select-image-date"
            onChange={e => this.setSelectedDate("pMines", e.target.value)}
            value={newSelectedDates.pMines}
          >
            {(pMines || []).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div style={{textAlign: "center", width: "100%"}}>
          <Button
            className="mt-2"
            onClick={() => selectDates(newSelectedDates)}
          >
            {filter.updateMap}
          </Button>
        </div>
      </ToolPanel>
    );
  }
}
FilterPanel.contextType = MainContext;
