import React from "react";

import {MainContext} from "./context";

export default class FilterPanel extends React.Component {
    constructor(props) {
        super(props);

        this.range = {
            minProbability: 0,
            maxProbability: 100,
            minYear: 2000,
            maxYear: 2019
        };

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
        const {showComposite, isHidden, selectDate, imageDates} = this.props;
        const {newSelectedDate} = this.state;
        const {selectedDate} = this.context;
        return (
            <div className={"popup-container filter-panel " + (isHidden ? "see-through" : "")}>
                <h3>FILTER DATA</h3>
                <br/>
                {/* <input
                    className="form-check-input"
                    defaultChecked={showComposite}
                    id="showcomposite"
                    onChange={toggleShowComposite}
                    type="checkbox"
                />
                Show Composite
                <br/>
                <small className="form-text text-muted">time series agreement (%)</small> */}
                {showComposite
                    ? (
                        <div>
                            <div className="inputLabel">Sliders to change time-series agreement(%) range</div>
                            <div className="slider-div">
                                <input id="probabilitySlider" type="text"/>
                            </div>
                            <br/>
                            <div className="inputLabel">Sliders to change years </div>
                            <div className="slider-div">
                                <input id="yearSlider" type="text"/>
                            </div>
                        </div>
                    ) : (
                        <div style={{display: "flex", flexDirection: "column"}}>
                            <label htmlFor="select-image-date">Select a date of prediction</label>
                            <select
                                id="select-image-date"
                                onChange={e => this.setState({newSelectedDate: e.target.value})}
                            >
                                {(imageDates || []).map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    ) }
                <div style={{textAlign: "center", width: "100%"}}>
                    <button
                        className="map-upd-btn"
                        disabled={newSelectedDate === selectedDate}
                        onClick={() => selectDate(newSelectedDate)}
                        style={{marginTop: ".5rem"}}
                        type="button"
                    >
                        Update Map
                    </button>
                </div>
            </div>
        );
    }
}
FilterPanel.contextType = MainContext;
