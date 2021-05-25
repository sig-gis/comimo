import React from "react";
import ReactDOM from "react-dom";

const buttonStyle = disabled => (disabled
  ? {
    backgroundColor: "lightgray",
    color: "gray",
    cursor: "not-allowed"
  } : {
    backgroundColor: "gray",
    color: "black",
    cursor: "pointer"
  });

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

  loadDates = () => fetch("/subscribe/get-data-dates")
    .then(response => response.json())
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
      <button
        className="btn-primary"
        onClick={() => downloadData("csv")}
        style={buttonStyle(false)}
        type="button"
      >
        Download CSV
      </button>
      <button
        className="btn-primary"
        onClick={() => downloadData("json")}
        style={buttonStyle(false)}
        type="button"
      >
        Download JSON
      </button>
    </div>
  );

  render() {
    const {dataType, availableDates: {predictions, userMines}, collectedData} = this.state;
    predictions.sort();
    userMines.sort();
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
      table: null,
      selectedDate: -1
    };
  }

  componentDidMount() {
    const table = new Tabulator("#prediction-table", {
      layout: "fitColumns", // fit columns to width of table
      responsiveLayout: "hide", // hide columns that dont fit on the table
      tooltips: true, // show tool tips on cells
      addRowPos: "top", // when adding a new row, add it to the top of the table
      history: true, // allow undo and redo actions on the table
      pagination: "local",
      paginationSize: 100,
      movableColumns: true, // allow column order to be changed
      resizableRows: true, // allow row order to be changed
      columns: [
        // define the table columns
        {title: "user", field: "username", headerFilter: "input"},
        {title: "longitude", field: "y", headerFilter: "input"},
        {title: "latitude", field: "x", headerFilter: "input"},
        {title: "dataLayer", field: "dataLayer", headerFilter: "input"},
        {title: "mine", field: "classNum", headerFilter: "number"},
        {title: "label", field: "className", headerFilter: "input"}
      ]
    });
    this.setState({table});
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.collectedData !== this.props.collectedData) {
      const {table, selectedDate} = this.state;
      const {collectedData} = this.props;
      table.clearData();
      table.setData(collectedData[selectedDate]);
    }
  }

  /// Change State ///

  changeDate = newDate => {
    const {table} = this.state;
    const {collectedData} = this.props;
    table.clearData();
    table.setData(collectedData[newDate]);
    this.setState({selectedDate: newDate});
  };

  /// API Calls ///

  loadDateData = dataLayer => {
    const {addCollectedData} = this.props;
    fetch(`/subscribe/download-predictions?dataLayer=${dataLayer}`)
      .then(response => response.json())
      .then(data => {
        addCollectedData(dataLayer, data);
      })
      .catch(err => console.error(err));
  };

  /// Helper Functions ///

  downloadData = type => {
    const {table, selectedDate} = this.state;
    table.download(type, `validated-predictions-${selectedDate}-data.${type}`);
  };

  render() {
    const {selectedDate} = this.state;
    const {predictions, collectedData, renderButtons} = this.props;
    predictions.sort().reverse();
    return (
      <>
        <div>
          <label htmlFor="project-date">Prediction date</label>
          <select
            id="project-date"
            onChange={e => this.changeDate(e.target.value)}
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
          <button
            disabled={selectedDate === -1}
            onClick={() => this.loadDateData(selectedDate)}
            style={buttonStyle(selectedDate === -1)}
            type="button"
          >
            {collectedData[selectedDate] ? "Reload" : "Load"}
          </button>
        </div>
        <div id="prediction-table" style={{flex: 1}}/>
        {renderButtons(this.downloadData)}
      </>
    );
  }
}

class UserMines extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      table: null,
      selectedDate: -1
    };
  }

  componentDidMount() {
    const table = new Tabulator("#prediction-table", {
      layout: "fitColumns", // fit columns to width of table
      responsiveLayout: "hide", // hide columns that dont fit on the table
      tooltips: true, // show tool tips on cells
      addRowPos: "top", // when adding a new row, add it to the top of the table
      history: true, // allow undo and redo actions on the table
      pagination: "local",
      paginationSize: 100,
      movableColumns: true, // allow column order to be changed
      resizableRows: true, // allow row order to be changed
      columns: [
        // define the table columns
        {title: "user", field: "username", headerFilter: "input"},
        {title: "longitude", field: "y", headerFilter: "input"},
        {title: "latitude", field: "x", headerFilter: "input"},
        {title: "reportedDate", field: "reportedDate", headerFilter: "date"}
      ]
    });
    this.setState({table});
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.collectedData !== this.props.collectedData) {
      const {table, selectedDate} = this.state;
      const {collectedData} = this.props;
      table.clearData();
      table.setData(collectedData[selectedDate]);
    }
  }

  /// Change State ///

  changeDate = newDate => {
    const {table} = this.state;
    const {collectedData} = this.props;
    table.clearData();
    table.setData(collectedData[newDate]);
    this.setState({selectedDate: newDate});
  };

  /// API Calls ///

  loadDateData = month => {
    const {addCollectedData} = this.props;
    fetch(`/subscribe/download-user-mines?month=${month}`)
      .then(response => response.json())
      .then(data => {
        addCollectedData(month, data);
      })
      .catch(err => console.error(err));
  };

  /// Helper Functions ///

  downloadData = type => {
    const {table, selectedDate} = this.state;
    table.download(type, `user-mines-${selectedDate}-data.${type}`);
  };

  render() {
    const {selectedDate} = this.state;
    const {userMines, collectedData, renderButtons} = this.props;
    userMines.sort().reverse();
    return (
      <>
        <div>
          <label htmlFor="project-date">Reporting month</label>
          <select
            id="project-date"
            onChange={e => this.changeDate(e.target.value)}
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
          <button
            disabled={selectedDate === -1}
            onClick={() => this.loadDateData(selectedDate)}
            style={buttonStyle(selectedDate === -1)}
            type="button"
          >
            {collectedData[selectedDate] ? "Reload" : "Load"}
          </button>
        </div>
        <div id="prediction-table" style={{flex: 1}}/>
        {renderButtons(this.downloadData)}
      </>
    );
  }
}

export function pageInit(args) {
  ReactDOM.render(<DownloadData/>, document.getElementById("main-container"));
}
