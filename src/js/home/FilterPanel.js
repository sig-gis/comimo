import React from "react";

import {MainContext} from "./context";

export default class FilterPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newSelectedDates: null
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.isHidden === true && this.props.isHidden === false) {
      this.setState({newSelectedDates: this.context.selectedDates});
    }
  }

    setSelectedDate = (type, date) => {
      this.setState({newSelectedDates: {...this.state.newSelectedDates, [type]: date}});
    };

    render() {
      const {isHidden, selectDates, imageDates: {nMines, pMines, cMines}} = this.props;
      const {newSelectedDates} = this.state;
      const {localeText: {filter, layers}} = this.context;
      return (
        <div className={"popup-container filter-panel " + (isHidden ? "see-through" : "")}>
          <h3>{filter.title.toUpperCase()}</h3>
          <span htmlFor="select-image-date">{filter.selectLabel}:</span>
          <div style={{display: "flex", flexDirection: "column"}}>
            <label htmlFor="select-image-date">{layers.cMines}</label>
            <select
              id="select-image-date"
              onChange={e => this.setSelectedDate("cMines", e.target.value)}
            >
              {(cMines || []).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <label htmlFor="select-image-date">{layers.nMines}</label>
            <select
              id="select-image-date"
              onChange={e => this.setSelectedDate("nMines", e.target.value)}
            >
              {(nMines || []).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <label htmlFor="select-image-date">{layers.pMines}</label>
            <select
              id="select-image-date"
              onChange={e => this.setSelectedDate("pMines", e.target.value)}
            >
              {(pMines || []).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div style={{textAlign: "center", width: "100%"}}>
            <button
              className="map-upd-btn"
              onClick={() => selectDates(newSelectedDates)}
              style={{marginTop: ".5rem"}}
              type="button"
            >
              {filter.updateMap}
            </button>
          </div>
        </div>
      );
    }
}
FilterPanel.contextType = MainContext;
