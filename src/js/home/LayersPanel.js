import React from "react";
import { MainContext } from "../components/PageLayout";

import NICFIControl from "../components/NICFIControl";
import ToolPanel from "../components/ToolPanel";

import { startVisible, availableLayers } from "../constants";

export default class LayersPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: null,
      opacity: null,
    };
  }

  componentDidMount() {
    this.setState({
      visible: availableLayers.reduce(
        (acc, cur) => ({ ...acc, [cur]: startVisible.includes(cur) || false }),
        {}
      ),
      opacity: availableLayers.reduce((acc, cur) => ({ ...acc, [cur]: 100 }), {}),
    });
  }

  setVisible = (name, layerVisible) => {
    const { visible } = this.state;
    const { theMap } = this.props;
    theMap.setLayoutProperty(name, "visibility", layerVisible ? "visible" : "none");
    this.setState({ visible: { ...visible, [name]: layerVisible } });
  };

  setOpacity = (name, newOpacity) => {
    const { opacity } = this.state;
    const { theMap } = this.props;
    theMap.setPaintProperty(name, "raster-opacity", newOpacity / 100);
    this.setState({
      opacity: { ...opacity, [name]: newOpacity },
    });
  };

  renderControl = (name) => {
    const { opacity, visible } = this.state;
    const {
      localeText: { layers },
    } = this.context;
    const layerVisible = visible[name];
    return (
      <div key={name} className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <input
            checked={layerVisible}
            id={"label-" + name}
            onChange={() => this.setVisible(name, !layerVisible)}
            type="checkbox"
          />
          <label htmlFor={"label-" + name} style={{ margin: "0 0 3px 0" }}>
            {layers[name]}
          </label>
        </div>
        <input
          className="p-0 m-0"
          max="100"
          min="0"
          onChange={(e) => this.setOpacity(name, parseInt(e.target.value))}
          style={{ width: "40%" }}
          type="range"
          value={opacity[name]}
        />
      </div>
    );
  };

  renderHeading = (layers) => (
    <>
      <div className="d-flex justify-content-between mb-0">
        <label style={{ fontWeight: "bold", margin: "0 .25rem 0 0" }}>{layers.nameLabel}</label>
        <label style={{ fontWeight: "bold", margin: "0 .25rem", width: "40%" }}>
          {layers.opacityLabel}
        </label>
      </div>
      <hr style={{ marginBottom: "0.5rem" }}></hr>
    </>
  );

  renderNICFISection = () => (
    <>
      <label style={{ fontWeight: "bold", margin: "0 .25rem 0 0" }}>
        Updated Satellite Imagery
      </label>
      <hr style={{ marginBottom: "0.5rem" }}></hr>
      <div className="d-flex flex-column">
        {this.renderControl("NICFI")}
        <NICFIControl
          extraParams={this.props.extraParams}
          nicfiLayers={this.props.nicfiLayers}
          setParams={this.props.setParams}
        />
      </div>
    </>
  );

  render() {
    const { opacity, visible } = this.state;
    const {
      localeText: { layers },
    } = this.context;
    return (
      <ToolPanel title={layers.title}>
        {this.renderHeading(layers)}
        {opacity &&
          visible &&
          availableLayers.map((layerName) =>
            layerName === "NICFI" ? "" : this.renderControl(layerName)
          )}
        <br></br>
        {opacity && visible && this.renderNICFISection("NICFI")}
      </ToolPanel>
    );
  }
}
LayersPanel.contextType = MainContext;
