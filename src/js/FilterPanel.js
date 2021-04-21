import React from "react";

import {MainContext} from "./context";

export default class FilterPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newSelectedDate: null
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.isHidden === true && this.props.isHidden === false) {
            this.setState({newSelectedDate: this.context.selectedDate});
        }
    }

    render() {
        const {isHidden, selectDate, imageDates} = this.props;
        const {newSelectedDate} = this.state;
        const {selectedDate, localeText: {filter}} = this.context;
        return (
            <div className={"popup-container filter-panel " + (isHidden ? "see-through" : "")}>
                <h3>{filter.title.toUpperCase()}</h3>
                <div style={{display: "flex", flexDirection: "column"}}>
                    <label htmlFor="select-image-date">{filter.selectLabel}</label>
                    <select
                        id="select-image-date"
                        onChange={e => this.setState({newSelectedDate: e.target.value})}
                    >
                        {(imageDates || []).map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
                <div style={{textAlign: "center", width: "100%"}}>
                    <button
                        className="map-upd-btn"
                        disabled={newSelectedDate === selectedDate}
                        onClick={() => selectDate(newSelectedDate)}
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
