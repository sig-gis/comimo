import React from "react";

import LoginMessage from "./LoginMessage";

import {MainContext} from "./context";

export default class SubscribePanel extends React.Component {
  constructor(props) {
    super(props);

    this.URLS = {
      SUBS: "user-subscriptions",
      DELSUBS: "remove-subscription",
      ADDSUBS: "add-subscription"
    };

    this.state = {
      subsLoaded: false
    };
  }

  componentDidMount() {
    this.getSubs();
  }

  getSubs() {
    const {updateSubList} = this.props;
    const {username, localeText: {subscribe}} = this.context;
    if (username) {
      fetch(this.URLS.SUBS, {method: "POST"})
        .then(response => (response.ok ? response.json() : Promise.reject(response)))
        .then(result => {
          if (Array.isArray(result)) {
            this.setState({subsLoaded: true});
            updateSubList(result.sort());
          } else {
            alert(subscribe[result]);
          }
        })
        .catch(err => console.error(err));
    }
  }

  addSubs(region) {
    const {updateSubList} = this.props;
    const {localeText: {subscribe}} = this.context;
    if (region !== "") {
      fetch(
        this.URLS.ADDSUBS,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            boundaryType: region[0],
            location: region[1]
          })
        }
      )
        .then(response => (response.ok ? response.json() : Promise.reject(response)))
        .then(result => {
          if (Array.isArray(result)) {
            this.setState({subsLoaded: true});
            updateSubList(result.sort());
          } else {
            alert(subscribe[result]);
          }
        })
        .catch(err => console.error(err));
    }
  }

  delSubs(boundaryType, location) {
    const {updateSubList} = this.props;
    const {localeText: {subscribe}} = this.context;
    const arr = location.split("_");
    const delConfirm = confirm(
      `${subscribe.delConfirm1} ${arr.reverse().join(", ")}? ${subscribe.delConfirm2}`
    );
    if (delConfirm) {
      fetch(
        this.URLS.DELSUBS,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            boundaryType,
            location
          })
        }
      )
        .then(response => (response.ok ? response.json() : Promise.reject(response)))
        .then(result => {
          if (Array.isArray(result)) {
            this.setState({subsLoaded: true});
            updateSubList(result.sort());
          } else {
            alert(subscribe[result]);
          }
        })
        .catch(err => console.error(err));
    }
  }

  renderSubscribedTable(subscribedList) {
    const {localeText: {subscribe}} = this.context;
    return (
      <table style={{width: "100%", textAlign: "left", fontSize: "1rem"}}>
        <thead>
          <tr>
            <th style={{width: "20px"}}>#</th>
            <th style={{width: "calc(100% - 50px)"}}>{subscribe.munLabel}</th>
            <th style={{width: "30px"}}>{subscribe.shortDelete}</th>
          </tr>
        </thead>
        <tbody>
          {subscribedList.map((region, idx) => {
            console.log(subscribedList, region);
            const arr = region.split("_");
            return (
              <tr key={region}>
                <td style={{width: "20px"}}>{idx + 1}</td>
                <td style={{width: "calc(100% - 50px)"}}>
                  {arr[2] + ", "}
                  <i>{arr[1]}</i>
                </td>
                <td style={{width: "30px"}}>
                  <input
                    className="del-btn"
                    onClick={() => this.delSubs(arr[0], arr[1] + "_" + arr[2])}
                    type="submit"
                    value="X"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  render() {
    const {subsLoaded} = this.state;
    const {isHidden} = this.props;
    const {selectedRegion, subscribedList, username, localeText: {subscribe}} = this.context;
    const parsedRegion = selectedRegion && selectedRegion[1].split("_");
    return (
      <div className={"popup-container subs-panel " + (isHidden ? "see-through" : "")}>
        <h3>{subscribe.title.toUpperCase()}</h3>
        {username ? (
          <div>
            {subscribedList.length === 0
              ? <p>{subsLoaded ? subscribe.noSubs : subscribe.loadingSubs}</p>
              : (
                <div>
                  <span>{subscribe.subscribedTo}:</span>
                  {this.renderSubscribedTable(subscribedList)}
                </div>
              )}
            {parsedRegion && !subscribedList.find(e => e === selectedRegion[0] + "_" + selectedRegion[1]) && (
              <div style={{textAlign: "center", width: "100%"}}>
                <button
                  className="map-upd-btn"
                  onClick={() => this.addSubs(selectedRegion)}
                  type="button"
                >
                  {`${subscribe.subscribeTo} ${parsedRegion[1]}, `}<i>{parsedRegion[0]}</i>
                </button>
              </div>
            )}
          </div>
        ) : (
          <LoginMessage actionText={subscribe.loginAction}/>
        )}
      </div>
    );
  }
}
SubscribePanel.contextType = MainContext;
