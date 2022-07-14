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

  renderControlWrapper = (name) =>
    name === "NICFI" ? (
      <div key={name} className="d-flex flex-column">
        {this.renderControl(name)}
        <NICFIControl
          extraParams={this.props.extraParams}
          nicfiLayers={this.props.nicfiLayers}
          setParams={this.props.setParams}
        />
      </div>
    ) : (
      this.renderControl(name)
    );

  render() {
    const { opacity, visible } = this.state;
    const {
      localeText: { layers },
    } = this.context;
    return (
      <ToolPanel title={layers.title}>
        <div className="d-flex justify-content-between mb-2">
          <label style={{ margin: "0 .25rem" }}>{layers.nameLabel}</label>
          <div style={{ width: "40%" }}>
            <label style={{ margin: "0 .25rem" }}>{layers.opacityLabel}</label>
          </div>
        </div>
        {opacity && visible && availableLayers.map((l) => this.renderControlWrapper(l))}
      </ToolPanel>
    );
  }
}
LayersPanel.contextType = MainContext;
