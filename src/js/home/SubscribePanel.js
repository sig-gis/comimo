import React from "react";
import styled from "@emotion/styled";

import LoginMessage from "./LoginMessage";
import Button from "../components/Button";
import Search from "../components/Search";
import ToolPanel from "../components/ToolPanel";

import { URLS } from "../constants";
import { jsonRequest } from "../utils";
import { MainContext } from "../components/PageLayout";

export default class SubscribePanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      subsLoaded: false,
    };
  }

  componentDidMount() {
    this.getSubs();
  }

  subsResult = (result) => {
    const { updateSubList } = this.props;
    const {
      localeText: { subscribe },
    } = this.context;
    if (Array.isArray(result)) {
      this.setState({ subsLoaded: true });
      updateSubList(result.sort());
    } else {
      alert(subscribe[result]);
    }
  };

  getSubs = () => {
    jsonRequest(URLS.USER_SUBS)
      .then((result) => {
        this.subsResult(result);
      })
      .catch((err) => console.error(err));
  };

  addSubs = (region) => {
    if (region !== "") {
      jsonRequest(URLS.ADD_SUBS, { region })
        .then((result) => {
          this.subsResult(result);
        })
        .catch((err) => console.error(err));
    }
  };

  delSubs = (region) => {
    const {
      localeText: { subscribe },
    } = this.context;
    const arr = region.split("_");
    const delConfirm = confirm(
      `${subscribe.delConfirm1} ${arr.reverse().join(", ")}? ${subscribe.delConfirm2}`
    );
    if (delConfirm) {
      jsonRequest(URLS.DEL_SUBS, { region })
        .then((result) => {
          this.subsResult(result);
        })
        .catch((err) => console.error(err));
    }
  };

  renderSubscribedTable(subscribedList) {
    const {
      localeText: { subscribe },
    } = this.context;
    return (
      <table style={{ width: "100%", textAlign: "left", fontSize: "1rem" }}>
        <thead>
          <tr>
            <th style={{ width: "20px" }}>#</th>
            <th style={{ width: "calc(100% - 50px)" }}>{subscribe.munLabel}</th>
            <th style={{ width: "30px" }}>{subscribe.shortDelete}</th>
          </tr>
        </thead>
        <tbody>
          {subscribedList.map((region, idx) => {
            const arr = region.split("_");
            return (
              <tr key={region}>
                <td style={{ width: "20px" }}>{idx + 1}</td>
                <td style={{ width: "calc(100% - 50px)" }}>
                  {arr[2] + ", "}
                  <i>{arr[1]}</i>
                </td>
                <td style={{ width: "30px" }}>
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
    const { subsLoaded } = this.state;
    const { featureNames, fitMap, mapquestKey, selectedRegion, selectRegion, subscribedList } =
      this.props;
    const {
      username,
      localeText: { subscribe },
    } = this.context;
    const parsedRegion = selectedRegion && selectedRegion.split("_");
    const Title = styled.h2`
      border-bottom: 1px solid gray;
      font-weight: bold;
      padding: 0.5rem;
    `;
    return (
      <ToolPanel title={subscribe.title}>
        {username ? (
          <>
            <div>
              {subscribedList.length === 0 ? (
                <p>{subsLoaded ? subscribe.noSubs : subscribe.loadingSubs}</p>
              ) : (
                <div>
                  <span>{subscribe.subscribedTo}:</span>
                  {this.renderSubscribedTable(subscribedList)}
                </div>
              )}
            </div>
            <div>
              <Title>{subscribe.addNew}</Title>
              <Search
                featureNames={featureNames}
                fitMap={fitMap}
                mapquestKey={mapquestKey}
                selectRegion={selectRegion}
              ></Search>
              {selectedRegion && !subscribedList.includes(selectedRegion) && (
                <div style={{ textAlign: "center", width: "100%" }}>
                  <Button onClick={() => this.addSubs(selectedRegion)}>
                    {`${subscribe.subscribeTo} ${parsedRegion[2]}, `}
                    <i>{parsedRegion[1]}</i>
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <LoginMessage actionText={subscribe.loginAction} />
        )}
      </ToolPanel>
    );
  }
}
SubscribePanel.contextType = MainContext;
