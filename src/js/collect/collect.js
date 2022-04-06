import React from "react";
import ReactDOM from "react-dom";
import MenuItem from "../components/MenuItem";
import PageLayout from "../components/PageLayout";
import SideBar from "../components/SideBar";
import SideIcon from "../components/SideIcon";
import ToolPanel from "../components/ToolPanel";
import {MainContext, URLS} from "../home/constants";
import {jsonRequest} from "../utils";
import CollectMap from "./CollectMap";

class CollectContent extends React.Component {
  constructor(props) {
    super(props);

    // combining everything to app state
    this.state = {
      visiblePanel: null,
      theMap: null,
      selectedLatLon: null,
      projectDetails: {}
    };
  }

  /// Lifecycle Functions ///

  componentDidMount() {
    this.getProjectData();
  }

  getProjectData = () => jsonRequest(URLS.PROJ_DATA, {projectId: this.props.projectId})
    .then(result => {
      this.setState({projectDetails: result});
    });

  /// State Update ///

  togglePanel = panelKey => {
    const {visiblePanel} = this.state;
    this.setState({
      visiblePanel: panelKey === visiblePanel ? null : panelKey
    });
  };

  setMap = theMap => this.setState({theMap});

  setLatLon = latLon => this.setState({selectedLatLon: latLon});

  render() {
    const {setShowInfo, myHeight, localeText: {home}} = this.context;
    return (
      <>
        <CollectMap
          boundary={this.state.projectDetails.boundary}
          localeText={this.context.localeText}
          myHeight={myHeight}
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
