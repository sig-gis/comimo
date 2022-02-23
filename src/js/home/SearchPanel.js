import React from "react";

import {MainContext} from "./context";
import {mapQuestKey} from "../appConfig";
import {sendRequest} from "../utils";

export default class SearchPanel extends React.Component {
  constructor(props) {
    super(props);

    this.URLS = {
      GEOCODE: "https://open.mapquestapi.com/geocoding/v1/address"
    };

    this.state = {
      geoCodedSearch: null,
      selectedL1: -1,
      selectedL2: -1,
      searchText: "",
      latLngText: ""
    };
  }

  searchGeocode = () => {
    const {searchText} = this.state;
    const {featureNames} = this.context;
    const url = this.URLS.GEOCODE + "?key=" + mapQuestKey + "&county=" + searchText + "&country=colombia";
    sendRequest(url, null, "GET")
      .then(result => {
        this.setState({
          geoCodedSearch: result.results[0].locations.filter(l => {
            try {
              return l.adminArea1 === "CO"
                              && featureNames[l.adminArea3.toUpperCase()][l.adminArea4.toUpperCase()]
                              && !l.adminArea5
                              && !l.adminArea6;
            } catch (err) {
              return false;
            }
          })
        });
      })
      .catch(error => console.error(error));
  };

  processLatLng = () => {
    const {latLngText} = this.state;
    const {fitMap} = this.props;
    const pair = latLngText.split(",");
    const nump = pair
      .map(a => parseFloat(a))
      .slice(0, 2);
    fitMap("point", [nump[1], nump[0]]);
  };

  render() {
    const {geoCodedSearch, selectedL1, selectedL2, searchText, latLngText} = this.state;
    const {fitMap, selectRegion, isHidden} = this.props;
    const {featureNames, localeText: {search}} = this.context;

    const geoSearchResults = geoCodedSearch && geoCodedSearch.length === 0
      ? <label>{search.noResults}</label>
      : geoCodedSearch && (
        <div>{geoCodedSearch.slice(0, 3).map(item => (
          <div
            key={item.adminArea3}
            className="search-results"
            onClick={() => {
              const state = item.adminArea3.toUpperCase();
              const mun = item.adminArea4.toUpperCase();
              this.setState({selectedL1: state, selectedL2: mun});
              fitMap("bbox", featureNames[state][mun]);
              selectRegion("mun_" + item.adminArea3.toUpperCase() + "_" + item.adminArea4.toUpperCase());
            }}
            style={{display: "flex", flexDirection: "column"}}
          >
            <span><b>{item.adminArea1}</b>&nbsp;<i>{item.adminArea4}, {item.adminArea3}</i></span>
            <span>{item.latLng.lat},{item.latLng.lng}</span>
          </div>
        ))}
        </div>
      );

    const l1Names = Object.keys(featureNames).sort() || [];
    const selectL1 = l1Names.length > 0
      ? (
        <div className="w_100">
          <small>{search.stateLabel}</small>
          <select
            className="w_100"
            onChange={e => this.setState({selectedL1: e.target.value, selectedL2: -1})}
            value={selectedL1}
          >
            <option key={-1} disabled value={-1}>{search.defaultState}</option>
            {l1Names.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      )
      : search.loading + "...";

    const activeMuns = featureNames[selectedL1] || {};
    const l2names = Object.keys(activeMuns).sort();
    const selectL2 = l2names.length > 0
      ? (
        <div className="w_100">
          <small>{search.munLabel}</small>
          <select
            className="w_100"
            onChange={e => {
              const l2Name = e.target.value;
              const coords = activeMuns[l2Name];
              this.setState({selectedL2: l2Name});
              if (Array.isArray(coords)) fitMap("bbox", coords);
              selectRegion("mun_" + selectedL1 + "_" + l2Name);
            }}
            value={selectedL2}
          >
            <option key={-1} disabled value={-1}>{search.defaultMun}</option>
            {l2names.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      ) : "";

    return (
      <div className={"popup-container search-panel " + (isHidden ? "see-through" : "")}>
        <h3>{search.title}</h3>
        <label>{search.internetLabel}</label>
        <div className="d-flex">
          <input
            className="w_100"
            onChange={e => this.setState({searchText: e.target.value})}
            onKeyUp={e => { if (e.key === "Enter") this.searchGeocode(); }}
            value={searchText}
          />
          <button className="map-upd-btn" onClick={this.searchGeocode} type="button">
            {search.goButton}
          </button>
        </div>
        {geoSearchResults}
        <label>{search.coordLabel}</label>
        <div className="d-flex">
          <input
            className="w_100"
            onChange={e => this.setState({latLngText: e.target.value})}
            onKeyUp={e => { if (e.key === "Enter") this.processLatLng(); }}
            value={latLngText}
          />
          <button className="map-upd-btn" onClick={this.processLatLng} type="button">
            {search.goButton}
          </button>
        </div>
        <label>{search.selectLabel}</label>
        {selectL1}
        {selectL2}
      </div>
    );
  }
}
SearchPanel.contextType = MainContext;
