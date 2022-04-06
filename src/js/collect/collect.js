import React from "react";
import ReactDOM from "react-dom";

import MenuItem from "../components/MenuItem";
import {PageLayout, MainContext} from "../components/PageLayout";
import SideBar from "../components/SideBar";
import SideIcon from "../components/SideIcon";
import ToolPanel from "../components/ToolPanel";

import {URLS} from "../constants";
import {jsonRequest} from "../utils";
import CollectMap from "./CollectMap";
import NavBar from "./NavBar";

class CollectContent extends React.Component {
  constructor(props) {
    super(props);

    // combining everything to app state
    this.state = {
      visiblePanel: null,
      theMap: null,
      selectedLatLon: null,
      projectDetails: {},
      projectPlots: [],
      currentPlotId: -1
    };
  }

  /// Lifecycle Functions ///

  componentDidMount() {
    this.getProjectData();
    this.getProjectPlots();
  }

  getProjectData = () => jsonRequest(URLS.PROJ_DATA, {projectId: this.props.projectId})
    .then(result => {
      this.setState({projectDetails: result});
    });

  // TODO, this can probably be combined into get projectData
  getProjectPlots = () => jsonRequest(URLS.PROJ_PLOTS, {projectId: this.props.projectId})
    .then(result => {
      this.setState({projectPlots: result});
    });

  /// State Update ///

  togglePanel = panelKey => {
    const {visiblePanel} = this.state;
    this.setState({
      visiblePanel: panelKey === visiblePanel ? null : panelKey
    });
  };

  nextPlot = () => {
    const {currentPlotId, projectPlots} = this.state;
    const nextPlot = projectPlots.find(p => p.id > currentPlotId) || projectPlots[0];
    this.setState({currentPlotId: nextPlot.id});
  };

  prevPlot = () => {
    const {currentPlotId, projectPlots} = this.state;
    const plotsCopy = [...projectPlots].reverse();
    const prevPlot = plotsCopy.find(p => p.id < currentPlotId) || plotsCopy[0];
    this.setState({currentPlotId: prevPlot.id});
  };

  setMap = theMap => this.setState({theMap});

  setLatLon = latLon => this.setState({selectedLatLon: latLon});

  render() {
    const {setShowInfo, myHeight, localeText: {home}} = this.context;
    return (
      <>
        <CollectMap
          boundary={this.state.projectDetails.boundary}
          currentPlotId={this.state.currentPlotId}
          localeText={this.context.localeText}
          myHeight={myHeight}
          projectPlots={this.state.projectPlots}
          setLatLon={this.setLatLon}
          setMap={this.setMap}
          theMap={this.state.theMap}
        />
        {home && (
          <SideBar>
            {/* Layers */}
            <MenuItem
              itemName="layer"
              onClick={this.togglePanel}
              selectedItem={this.state.visiblePanel}
              tooltip={home.layersTooltip}
            >
              <ToolPanel title="Placeholder"/>
            </MenuItem>
            <SideIcon
              clickHandler={() => setShowInfo(true)}
              icon="info"
              parentClass="disclaimer"
              tooltip={home.appInfoTooltip}
            />
          </SideBar>
        )}
        <NavBar
          currentPlotId={this.state.currentPlotId}
          nextPlot={this.nextPlot}
          prevPlot={this.prevPlot}
        />
      </>
    );
  }
}
CollectContent.contextType = MainContext;

export function pageInit(args) {
  ReactDOM.render(
    <PageLayout
      role={args.role}
      userLang={args.userLang}
      username={args.username}
    >
      <CollectContent projectId={parseInt(args.projectId || 0)}/>
    </PageLayout>,
    document.getElementById("main-container")
  );
}
