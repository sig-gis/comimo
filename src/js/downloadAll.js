import React from "react";
import ReactDOM from "react-dom";

class DownloadAll extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      table: null,
      availableDates: [],
      selectedDate: -1,
      collectedData: {}
    };
  }

  componentDidMount() {
    this.loadDates();
    const table = new Tabulator("#data-table", {
      layout: "fitColumns", // fit columns to width of table
      responsiveLayout: "hide", // hide columns that dont fit on the table
      tooltips: true, // show tool tips on cells
      addRowPos: "top", // when adding a new row, add it to the top of the table
      history: true, // allow undo and redo actions on the table
      pagination: "local", // paginate the data
      paginationSize: 10, // allow 7 rows per page of data
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

    loadDates = () => {
      fetch("/get-data-dates")
        .then(response => response.json())
        .then(data => {
          this.setState({availableDates: data});
        })
        .catch(err => console.log(err));
    };

    loadDateData = () => {
      const {selectedDate, collectedData, table} = this.state;
      fetch(`/download-all?date=${this.state.selectedDate}`)
        .then(response => response.json())
        .then(data => {
          console.log(data);
          table.clearData();
          table.setData(data);
          this.setState({collectedData: {...collectedData, [selectedDate]: data}});
        })
        .catch(err => console.log(err));
    };

    changeDate = newDate => {
      const {collectedData, table} = this.state;
      table.clearData();
      table.setData(collectedData[newDate]);
      this.setState({selectedDate: newDate});
    };

    downloadData = type => {
      const {table, selectedDate} = this.state;
      table.download(type, `${selectedDate}-data.${type}`);
    };

    buttonStyle = disabled => (disabled
      ? {
        backgroundColor: "lightgray",
        color: "gray"
      } : {
        backgroundColor: "gray",
        color: "black"
      });

    render() {
      const {availableDates, selectedDate, collectedData} = this.state;
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "1.5rem 4rem",
            alignItems: "center",
            height: "100%"
          }}
        >
          <div>
            <label htmlFor="project-date">Prediction date</label>
            <select
              id="project-date"
              onChange={e => this.changeDate(e.target.value)}
              style={{padding: ".25rem", borderRadius: "3px", margin: ".75rem"}}
              value={selectedDate}
            >
              {selectedDate === -1 && (
                <option key={-1} value={-1}>{availableDates.length > 0 ? "Select Date..." : "Loading Dates..."}</option>
              )}
              {availableDates.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <button
              disabled={selectedDate === -1}
              onClick={this.loadDateData}
              style={this.buttonStyle(selectedDate === -1)}
              type="button"
            >
              {collectedData[selectedDate] ? "Reload" : "Load"}
            </button>
          </div>
          <div id="data-table" style={{flex: 1}}/>
          <div
            style={{
              textAlign: "right",
              padding: "1rem 0",
              width: "100%"
            }}
          >
            <button
              className="btn-primary"
              onClick={() => this.downloadData("csv")}
              style={this.buttonStyle(false)}
              type="button"
            >
                            Download CSV
            </button>
            <button
              className="btn-primary"
              onClick={() => this.downloadData("json")}
              style={this.buttonStyle(false)}
              type="button"
            >
                            Download JSON
            </button>
          </div>
        </div>
      );
    }
}

export function pageInit(args) {
  ReactDOM.render(<DownloadAll/>, document.getElementById("main-container"));
}
