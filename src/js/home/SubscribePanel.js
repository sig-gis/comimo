import React from "react";

import LoginMessage from "./LoginMessage";

import {MainContext} from "./context";
import {sendRequest} from "../utils";

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

  getSubs = () => {
    const {updateSubList} = this.props;
    const {username, localeText: {subscribe}} = this.context;
    if (username) {
      sendRequest(this.URLS.SUBS)
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
  };

  addSubs = region => {
    const {updateSubList} = this.props;
    const {localeText: {subscribe}} = this.context;
    if (region !== "") {
      sendRequest(this.URLS.ADDSUBS, {region})
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
  };

  delSubs = region => {
    const {updateSubList} = this.props;
    const {localeText: {subscribe}} = this.context;
    const arr = location.split("_");
    const delConfirm = confirm(
      `${subscribe.delConfirm1} ${arr.reverse().join(", ")}? ${subscribe.delConfirm2}`
    );
    if (delConfirm) {
      sendRequest(this.URLS.DELSUBS, {region})
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
  };

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
                    onClick={() => this.delSubs(region)}
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
    const parsedRegion = selectedRegion && selectedRegion.split("_");
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
            {selectedRegion && !subscribedList.includes(selectedRegion) && (
              <div style={{textAlign: "center", width: "100%"}}>
                <button
                  className="map-upd-btn"
                  onClick={() => this.addSubs(selectedRegion)}
                  type="button"
                >
                  {`${subscribe.subscribeTo} ${parsedRegion[2]}, `}<i>{parsedRegion[1]}</i>
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
