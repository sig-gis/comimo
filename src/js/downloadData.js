import React from "react";
import ReactDOM from "react-dom";
import {ReactTabulator} from "react-tabulator";
import {ThemeProvider} from "@emotion/react";

import Button from "./components/Button";
import "react-tabulator/lib/styles.css"; // required styles
import "react-tabulator/lib/css/tabulator_bootstrap4.min.css"; // theme

import {URLS, THEME} from "./constants";
import {jsonRequest} from "./utils";

class DownloadData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataType: "predictions",
      availableDates: {predictions: [], userMines: []},
      collectedData: {}
    };
  }

  componentDidMount() {
    this.loadDates();
  }

  /// Update State ///

  addCollectedData = (dataLayer, data) => {
    const {collectedData} = this.state;
    this.setState({collectedData: {...collectedData, [dataLayer]: data}});
  };

  /// API Calls ///

  loadDates = () => jsonRequest(URLS.DATA_DATES)
    .then(data => {
      this.setState({availableDates: data});
    })
    .catch(err => console.error(err));

  /// Render Functions ///

  renderButtons = downloadData => (
    <div
      style={{
        textAlign: "right",
        padding: "1rem 0",
        width: "100%"
      }}
    >
      <Button
        className="mr-1"
        onClick={() => downloadData("csv")}
      >
        Download CSV
      </Button>
      <Button
        onClick={() => downloadData("json")}
      >
        Download JSON
      </Button>
    </div>
  );

  render() {
    const {dataType, availableDates: {predictions, userMines}, collectedData} = this.state;
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "1rem 4rem",
          alignItems: "center",
          height: "100%"
        }}
      >
        <div className="d-flex">
          <span style={{marginTop: ".25rem"}}>
            <input
              checked={dataType === "predictions"}
              name="dataType"
              onChange={() => this.setState({dataType: "predictions"})}
              type="radio"
            />
              Collected predictions
          </span>
          <span style={{marginTop: ".25rem"}}>
            <input
              checked={dataType === "userMines"}
              name="dataType"
              onChange={() => this.setState({dataType: "userMines"})}
              type="radio"
            />
              User reported mines
          </span>
        </div>
        {this.state.dataType === "predictions"
          ? (
            <Predictions
              addCollectedData={this.addCollectedData}
              collectedData={collectedData}
              predictions={predictions}
              renderButtons={this.renderButtons}
            />
          ) : (
            <UserMines
              addCollectedData={this.addCollectedData}
              collectedData={collectedData}
              renderButtons={this.renderButtons}
              userMines={userMines}
            />
          )}
      </div>
    );
  }
}

class Predictions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: -1,
      tableRef: null
    };
  }

  /// API Calls ///

  loadDateData = dataLayer => {
    const {addCollectedData} = this.props;
    jsonRequest(URLS.PREDICTIONS, {dataLayer})
      .then(data => {
        addCollectedData(dataLayer, data);
      })
      .catch(err => console.error(err));
  };

  /// Helper Functions ///

  downloadData = type => {
    const {tableRef, selectedDate} = this.state;
    tableRef.current.download(type, `validated-predictions-${selectedDate}-data.${type}`);
  };

  render() {
    const {selectedDate} = this.state;
    const {predictions, collectedData, renderButtons} = this.props;
    return (
      <>
        <div>
          <label htmlFor="project-date">Prediction date</label>
          <select
            id="project-date"
            onChange={e => this.setState({selectedDate: e.target.value})}
            style={{padding: ".25rem", borderRadius: "3px", margin: ".75rem"}}
            value={selectedDate}
          >
            {selectedDate === -1 && (
              <option key={-1} value={-1}>{predictions.length > 0 ? "Select Date..." : "Loading Dates..."}</option>
            )}
            {predictions.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <Button
            disabled={selectedDate === -1}
            onClick={() => this.loadDateData(selectedDate)}
          >
            {collectedData[selectedDate] ? "Reload" : "Load"}
          </Button>
        </div>
        <ReactTabulator
          columns={[
          // define the table columns
            {title: "user", field: "username", headerFilter: "input"},
            {title: "email", field: "email", headerFilter: "input"},
            {title: "organization", field: "institution", headerFilter: "input"},
            {title: "project name", field: "projectName", headerFilter: "input"},
            {title: "latitude", field: "lat", headerFilter: "input"},
            {title: "longitude", field: "lon", headerFilter: "input"},
            {title: "dataLayer", field: "dataLayer", headerFilter: "input"},
            {title: "mine", field: "answer", headerFilter: "input"}
          ]}
          data={this.props.collectedData[selectedDate]}
          onRef={ref => this.setState({tableRef: ref})}
          options={{
            layout: "fitColumns", // fit columns to width of table
            responsiveLayout: "hide", // hide columns that dont fit on the table
            tooltips: true, // show tool tips on cells
            addRowPos: "top", // when adding a new row, add it to the top of the table
            history: true, // allow undo and redo actions on the table
            pagination: "local",
            paginationSize: 100,
            movableColumns: true, // allow column order to be changed
            resizableRows: true // allow row order to be changed
          }}
        />
        {renderButtons(this.downloadData)}
      </>
    );
  }
}

class UserMines extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: -1,
      tableRef: null
    };
  }

  /// API Calls ///

  loadDateData = yearMonth => {
    const {addCollectedData} = this.props;
    jsonRequest(URLS.USER_MINES, {yearMonth})
      .then(data => {
        addCollectedData(yearMonth, data);
      })
      .catch(err => console.error(err));
  };

  /// Helper Functions ///

  downloadData = type => {
    const {tableRef, selectedDate} = this.state;
    tableRef.current.download(type, `user-mines-${selectedDate}-data.${type}`);
  };

  render() {
    const {selectedDate} = this.state;
    const {userMines, collectedData, renderButtons} = this.props;
    return (
      <>
        <div>
          <label htmlFor="project-date">Reporting month</label>
          <select
            id="project-date"
            onChange={e => this.setState({selectedDate: e.target.value})}
            style={{padding: ".25rem", borderRadius: "3px", margin: ".75rem"}}
            value={selectedDate}
          >
            {selectedDate === -1 && (
              <option key={-1} value={-1}>{userMines.length > 0 ? "Select Date..." : "Loading Dates..."}</option>
            )}
            {userMines.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <Button
            disabled={selectedDate === -1}
            onClick={() => this.loadDateData(selectedDate)}
          >
            {collectedData[selectedDate] ? "Reload" : "Load"}
          </Button>
        </div>
        <ReactTabulator
          columns={[
            // define the table columns
            {title: "user", field: "username", headerFilter: "input"},
            {title: "email", field: "email", headerFilter: "input"},
            {title: "organization", field: "institution", headerFilter: "input"},
            {title: "longitude", field: "lat", headerFilter: "input"},
            {title: "latitude", field: "lon", headerFilter: "input"},
            {title: "reportedDate", field: "reportedDate", headerFilter: "input"}
          ]}
          data={this.props.collectedData[selectedDate]}
          onRef={ref => this.setState({tableRef: ref})}
          options={{
            layout: "fitColumns", // fit columns to width of table
            responsiveLayout: "hide", // hide columns that dont fit on the table
            tooltips: true, // show tool tips on cells
            addRowPos: "top", // when adding a new row, add it to the top of the table
            history: true, // allow undo and redo actions on the table
            pagination: "local",
            paginationSize: 100,
            movableColumns: true, // allow column order to be changed
            resizableRows: true // allow row order to be changed
          }}
        />
        {renderButtons(this.downloadData)}
      </>
    );
  }
}

export function pageInit(args) {
  ReactDOM.render(
    <ThemeProvider theme={THEME}>
      <DownloadData/>
    </ThemeProvider>,
    document.getElementById("main-container")
  );
}
