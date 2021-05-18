import React from "react";

import LoginMessage from "./LoginMessage";

import {MainContext} from "./context";

export default class SubscribePanel extends React.Component {
  constructor(props) {
    super(props);

    this.URLS = {
      SUBS: "subscribe/getsubs",
      DELSUBS: "subscribe/delsubs",
      ADDSUBS: "subscribe/addsubs"
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
    const {isUser} = this.context;
    if (isUser) {
      fetch(this.URLS.SUBS)
        .then(res => res.json())
        .then(result => {
          if (result.action === "Success") {
            this.setState({
              subsLoaded: true
            });
            updateSubList(result.regions.sort());
          }
        })
        .catch(err => console.log(err));
    }
  }

  addSubs(region) {
    const {updateSubList} = this.props;
    const {subscribedList, localeText: {subscribe}} = this.context;
    if (region !== "") {
      fetch(this.URLS.ADDSUBS + "?region=" + region[1] + "&level=" + region[0])
        .then(res => res.json())
        .then(result => {
          if (result.action === "Created") {
            const newList = [...subscribedList, result.level + "_" + result.region];
            newList.sort();
            updateSubList(newList);
          } else if (result.action === "Exists") {
            alert(subscribe.existing);
          }
        })
        .catch(err => console.log(err));
    }
  }

  delSubs(data) {
    const {updateSubList} = this.props;
    const {subscribedList, localeText: {subscribe}} = this.context;
    const arr = data.split("_");
    const level = arr.splice(0, 1);
    const delConfirm = confirm(
            `${subscribe.delConfirm1} ${arr.reverse().join(", ")}? ${subscribe.delConfirm2}`
    );
    if (delConfirm) {
      fetch(this.URLS.DELSUBS + "?region=" + arr.reverse().join("_") + "&level=" + level)
        .then(res => res.json())
        .then(result => {
          if (result.action !== "Error") {
            const newList = subscribedList.filter(r => r !== result.level + "_" + result.region);
            updateSubList(newList);
          }
        })
        .catch(err => console.log(err));
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
          {subscribedList.map((fullRegion, idx) => {
            const arr = fullRegion.split("_");
            return (
              <tr key={fullRegion}>
                <td style={{width: "20px"}}>{idx + 1}</td>
                <td style={{width: "calc(100% - 50px)"}}>
                  {arr[2] + ", "}
                  <i>{arr[1]}</i>
                </td>
                <td style={{width: "30px"}}>
                  <input
                    className="del-btn"
                    onClick={() => this.delSubs(fullRegion)}
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
    const {selectedRegion, subscribedList, isUser, localeText: {subscribe}} = this.context;
    const parsedRegion = selectedRegion && selectedRegion[1].split("_");
    return (
      <div className={"popup-container subs-panel " + (isHidden ? "see-through" : "")}>
        <h3>{subscribe.title.toUpperCase()}</h3>
        {isUser ? (
          <div>
            {subscribedList.length === 0
              ? <p>{subsLoaded ? subscribe.noSubs : subscribe.loadingSubs}</p>
              : (
                <div>
                  <span> {subscribe.subscribedTo}</span>
                  {this.renderSubscribedTable(subscribedList)}
                </div>
              )}
            {parsedRegion && subscribedList.indexOf(selectedRegion[0] + "_" + selectedRegion[1]) === -1 && (
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
