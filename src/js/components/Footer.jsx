import React, { useContext, useState } from "react";
import styled from "@emotion/styled";
import { MainContext } from "./PageLayout";

import IconButton from "./IconButton";
// import SubscribePanel from "../home/SubscribePanel";
// import LayersPanel from "../home/LayersPanel";
import IconTextButton from "./IconTextButton";

const FooterBar = styled.div`
  background-color: var(--gray-1);
  box-shadow: 3px 0px 6px #0000008d;
  display: flex;
  height: 60px;
  justify-content: space-between;
  text-align: center;
  width: 100%;
`;

const Buttons = styled.div`
  background-color: white;
  display: flex;
  flex: 3;
  justify-content: center;
`;

const MoreButtons = styled.div`
  flex: 1;
  background-color: red;
`;

const Logo = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
  padding: 5px 0;
`;

const LogoImg = styled.img`
  cursor: pointer;
  height: 22px;
  padding-right: 15px;
  width: 67px;
`;

const LogoGitVersion = styled.a`
  color: var(--white);
  cursor: pointer;
  font-size: 12px;
  letter-spacing: 0px;
  text-align: left;
  text-decoration: none;
`;

export default function Footer({ setShowInfo, version }) {
  const [visiblePanel, setVisiblePanel] = useState(null);
  const {
    localeText: { home },
    isAdmin,
  } = useContext(MainContext);

  const togglePanel = (panelKey) => {
    setVisiblePanel(panelKey === visiblePanel ? null : panelKey);
  };

  return (
    <FooterBar>
      <Buttons>
        {/* Layers */}
        <IconTextButton
          active={visiblePanel === "layers"}
          hasBackground={true}
          icon="layer"
          onClick={() => window.alert("layers panel", isAdmin)}
          // onClick={() => togglePanel("layers")}
          text="Layers"
        />
        {/* <LayersPanel
          extraParams={this.state.extraParams}
          nicfiLayers={this.state.nicfiLayers}
          setParams={this.setParams}
          theMap={this.state.theMap}
        /> */}

        {/* Subscribe */}
        <IconTextButton
          active={visiblePanel === "subscribe"}
          hasBackground={true}
          icon="envelope"
          onClick={() => window.alert("layers panel", isAdmin)}
          // onClick={() => togglePanel("layers")}
          text="Subscribe"
        />
        {/* <MenuItem
          icon="envelope"
          itemName="subscribe"
          onClick={togglePanel}
          selectedItem={visiblePanel}
          tooltip={localeText.home.subscribeTooltip}
        >
          <SubscribePanel
            featureNames={this.state.featureNames}
            fitMap={this.fitMap}
            mapquestKey={this.props.mapquestKey}
            selectedRegion={this.state.selectedRegion}
            selectRegion={this.selectRegion}
            subscribedList={this.state.subscribedList}
            updateSubList={this.updateSubList}
          />
        </MenuItem> */}
      </Buttons>
      <MoreButtons>
        {isAdmin && (
          <IconButton
            extraStyle={{ marginRight: "10px" }}
            icon="admin"
            onClick={() => window.location.assign("/admin")}
            // tooltip={localeText.home.admin}
          />
        )}
        <IconButton
          icon="info"
          onClick={() => setShowInfo(true)}
          // tooltip={localeText.home.appInfoTooltip}
        />
      </MoreButtons>
      <Logo id="footer-info-logo">
        <LogoImg
          alt="app-logo"
          onClick={() => window.location.assign("/")}
          src="/img/app-logo.png"
        />
        <LogoGitVersion href={`https://github.com/sig-gis/comimo/tags/${version}`} target="/blank">
          {version && `Version: ${version}`}
        </LogoGitVersion>
      </Logo>
    </FooterBar>
  );
}
