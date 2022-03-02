import React from "react";
import ReactDOM from "react-dom";

import DownloadPanel from "./DownloadPanel";
import LayersPanel from "./LayersPanel";
import FilterPanel from "./FilterPanel";
import SearchPanel from "./SearchPanel";
import SideIcon from "./SideIcon";
import StatsPanel from "./StatsPanel";
import SubscribePanel from "./SubscribePanel";
import ReportMinesPanel from "./ReportMinesPanel";
import ValidatePanel from "./ValidatePanel";

import {jsonRequest} from "../utils";
import PageLayout from "../components/pageLayout/PageLayout";
import HomeMap from "./HomeMap";
import {MainContext, URLS} from "./constants";

class HomeContents extends React.Component {
  // set up class flags so each component update doesn't do redundant JS tasks
  constructor(props) {
    super(props);

    // combining everything to app state
    this.state = {
      visiblePanel: null,
      advancedOptions: false,
      imageDates: {},
      selectedDates: {},
      selectedRegion: null,
      featureNames: {},
      subscribedList: [],
      theMap: null,
      selectedLatLon: null
    };
  }

  /// Lifecycle Functions ///

  componentDidMount() {
    Promise.all([this.getFeatureNames(), this.getImageDates()])
      .catch(error => console.error(error));
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.myHeight !== this.props.myHeight) {
      setTimeout(() => this.state.theMap.resize(), 50);
    }

    if (this.state.thePopup && prevState.reportHidden !== this.state.reportHidden) {
      this.setState({selectedLatLon: null});
      this.state.thePopup.remove();
    }
  }

  /// State Update ///

  togglePanel = panelKey => {
    const {visiblePanel} = this.state;
    this.setState({
      visiblePanel: panelKey === visiblePanel ? null : panelKey
    });
  };

  updateSubList = list => this.setState({subscribedList: list});

  selectDates = newDates => this.setState(
    {selectedDates: {...this.state.selectedDates, ...newDates}},
    this.updateEELayer
  );

  selectRegion = region => this.setState({selectedRegion: region});

  setMap = theMap => this.setState({theMap});

  setLatLon = latLon => this.setState({selectedLatLon: latLon});

  /// API Calls ///

  getImageDates = () => jsonRequest(URLS.IMG_DATES)
    .then(result => {
      const initialDates = Object.keys(result).reduce((acc, cur) =>
        ({...acc, [cur]: result[cur][0]}), {});
      this.setState({
        imageDates: result,
        selectedDates: initialDates
      });
    });

  getFeatureNames = () => jsonRequest(URLS.FEATURE_NAMES)
    .then(features => { this.setState({featureNames: features}); });

  render() {
    const {myHeight, username, localeText: {home}} = this.context;
    const {setShowInfo} = this.props;
    return (
      <>
        <HomeMap
          localeText={this.context.localeText}
          myHeight={myHeight}
          reportPopup={this.state.visiblePanel === "report"}
          selectDates={this.selectDates}
          selectedDates={this.state.selectedDates}
          setLatLon={this.setLatLon}
          setMap={this.setMap}
          theMap={this.state.theMap}
        />
        {home && (
          <div className="sidebar" style={{top: "3.5rem", height: "calc(100% - 3.5rem)"}}>
            {/* Layers */}
            <LayersPanel
              isVisible={this.state.visiblePanel === "layers"}
              theMap={this.state.theMap}
            />
            <SideIcon
              active={this.state.visiblePanel === "layers"}
              clickHandler={() => this.togglePanel("layers")}
              icon="layer"
              tooltip={home.layersTooltip}
            />

            {/* Subscribe */}
            <SideIcon
              active={this.state.visiblePanel === "subscribe"}
              clickHandler={() => this.togglePanel("subscribe")}
              icon="envelope"
              tooltip={home.subscribeTooltip}
            />
            <SubscribePanel
              isVisible={this.state.visiblePanel === "subscribe"}
              selectedRegion={this.state.selectedRegion}
              subscribedList={this.state.subscribedList}
              updateSubList={this.updateSubList}
            />

            {/* Validation */}
            <SideIcon
              active={this.state.visiblePanel === "validate"}
              clickHandler={() => this.togglePanel("validate")}
              icon="check"
              tooltip={home.validateTooltip}
            />
            <ValidatePanel
              featureNames={this.state.featureNames}
              isVisible={this.state.visiblePanel === "validate"}
              selectedDates={this.state.selectedDates}
              subscribedList={this.state.subscribedList}
            />

            {/* Geo location Search */}
            <SideIcon
              active={this.state.visiblePanel === "search"}
              clickHandler={() => this.togglePanel("search")}
              icon="search"
              tooltip={home.searchTooltip}
            />
            <SearchPanel
              featureNames={this.state.featureNames}
              fitMap={this.fitMap}
              isVisible={this.state.visiblePanel === "search"}
              selectedDates={this.state.selectedDates}
              selectRegion={this.selectRegion}
            />

            {/* Advanced Button */}
            {username && (
              <SideIcon
                clickHandler={() => {
                  this.setState(
                    this.state.advancedOptions
                      ? {advancedOptions: false, ...this.advancedPanelState}
                      : {advancedOptions: true}
                  );
                }}
                icon={this.state.advancedOptions ? "minus" : "plus"}
                subtext={home.advancedTooltip}
                tooltip={home.advancedTooltip}
              />
            )}
            {this.state.advancedOptions && (
              <>
                {/* Stats graphs */}
                <SideIcon
                  active={this.state.visiblePanel === "stats"}
                  clickHandler={() => this.togglePanel("stats")}
                  icon="stats"
                  tooltip={home.statsTooltip}
                />
                <StatsPanel
                  isVisible={this.state.visiblePanel === "stats"}
                  selectedDate={this.state.selectedDates.cMines}
                  subscribedList={this.state.subscribedList}
                />

                {/* Date filter */}
                <SideIcon
                  active={this.state.visiblePanel === "filter"}
                  clickHandler={() => this.togglePanel("filter")}
                  icon="filter"
                  tooltip={home.filterTooltip}
                />
                <FilterPanel
                  imageDates={this.state.imageDates}
                  isVisible={this.state.visiblePanel === "filter"}
                  selectDates={this.selectDates}
                  selectedDates={this.state.selectedDates}
                />

                {/* Report mines */}
                <SideIcon
                  active={this.state.visiblePanel === "report"}
                  clickHandler={() => this.togglePanel("report")}
                  icon="mine"
                  tooltip={home.reportTooltip}
                />
                <ReportMinesPanel
                  addPopup={this.addPopup}
                  fitMap={this.fitMap}
                  isVisible={this.state.visiblePanel === "report"}
                  selectedLatLon={this.state.selectedLatLon}
                  submitMine={this.submitMine}
                />

                {/* Download */}
                <SideIcon
                  active={this.state.visiblePanel === "download"}
                  clickHandler={() => this.togglePanel("download")}
                  icon="download"
                  tooltip={home.downloadTooltip}
                />
                <DownloadPanel
                  isVisible={this.state.visiblePanel === "download"}
                  selectedDates={this.state.selectedDates}
                  selectedRegion={this.state.selectedRegion}
                />
              </>
            )}
            <SideIcon
              clickHandler={() => setShowInfo(true)}
              icon="info"
              parentClass="disclaimer"
              tooltip={home.appInfoTooltip}
            />
          </div>
        )}

      </>
    );
  }
}
HomeContents.contextType = MainContext;

export function pageInit(args) {
  ReactDOM.render(
    <PageLayout
      role={args.role}
      userLang={args.userLang}
      username={args.username}
    >
      <HomeContents/>
    </PageLayout>,
    document.getElementById("main-container")
  );
}
