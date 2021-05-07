import React from "react";
import {MainContext} from "./context";

export default class LayersPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: null,
      opacity: null
    };
  }

  componentDidMount() {
    const {startVisible, availableLayers} = this.props;
    this.setState({
      visible: availableLayers.reduce((acc, cur) => ({...acc, [cur]: startVisible.includes(cur) || false}), {}),
      opacity: availableLayers.reduce((acc, cur) => ({...acc, [cur]: 100}), {})
    });
  }

    setVisible = (name, isVisible) => {
      const {visible} = this.state;
      const {theMap} = this.props;
      theMap.setLayoutProperty(name, "visibility", isVisible ? "visible" : "none");
      this.setState({visible: {...visible, [name]: isVisible}});
    };

    setOpacity = (name, newOpacity) => {
      const {opacity} = this.state;
      const {theMap} = this.props;
      theMap.setPaintProperty(name, "raster-opacity", newOpacity / 100);
      this.setState({
        opacity: {...opacity, [name]: newOpacity}
      });
    };

    renderControl = name => {
      const {opacity, visible} = this.state;
      const {localeText: {layers}} = this.context;
      const isVisible = visible[name];
      return (
        <div key={name} className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <input
              checked={isVisible}
              id={"label-" + name}
              onChange={() => this.setVisible(name, !isVisible)}
              type="checkbox"
            />
            <label htmlFor={"label-" + name} style={{margin: "0 0 3px 0"}}>{layers[name]}</label>
          </div>
          <input
            className="p-0 m-0"
            max="100"
            min="0"
            onChange={e => this.setOpacity(name, parseInt(e.target.value))}
            style={{width: "40%"}}
            type="range"
            value={opacity[name]}
          />
        </div>
      );
    };

    render() {
      const {opacity, visible} = this.state;
      const {availableLayers, isHidden} = this.props;
      const {localeText: {layers}} = this.context;
      return (
        <div
          className={"layer-container overflow-scroll " + (isHidden ? " see-through" : "")}
          style={{overflow: "auto"}}
        >
          <h3>{layers.title.toUpperCase()}</h3>
          <div className="d-flex justify-content-between mb-2">
            <label style={{margin: "0 .25rem"}}>{layers.nameLabel}</label>
            <div style={{width: "40%"}}>
              <label style={{margin: "0 .25rem"}}>{layers.opacityLabel}</label>
            </div>
          </div>
          {opacity && visible && availableLayers.map(l => this.renderControl(l))}
        </div>
      );
    }
}
LayersPanel.contextType = MainContext;
