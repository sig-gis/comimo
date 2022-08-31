import React, { useContext, useEffect, useState } from "react";
import { useAtom, useAtomValue } from "jotai";

import { MainContext } from "../components/PageLayout";
import NICFIControl from "../components/NICFIControl";
import ToolCard from "../components/ToolCard";

import { extraMapParamsAtom } from "../home";
import { startVisible, availableLayers } from "../constants";
import { homeMapAtom } from "./HomeMap";

export default function LayersPanel({ nicfiLayers, active }) {
  const [visible, setVisible] = useState(null);
  const [extraMapParams, setExtraMapParams] = useAtom(extraMapParamsAtom);
  const [opacity, setOpacity] = useState(null);
  const homeMap = useAtomValue(homeMapAtom);
  const {
    localeText: { layers },
  } = useContext(MainContext);

  const setParams = (param, value) => {
    setExtraMapParams({
      ...extraMapParams,
      [param]: value,
    });
  };

  useEffect(() => {
    setVisible(
      availableLayers.reduce(
        (acc, cur) => ({ ...acc, [cur]: startVisible.includes(cur) || false }),
        {}
      )
    );

    setOpacity(availableLayers.reduce((acc, cur) => ({ ...acc, [cur]: 100 }), {}));
  }, []);

  const setLayerVisible = (name, layerVisible) => {
    homeMap.setLayoutProperty(name, "visibility", layerVisible ? "visible" : "none");
    setVisible({ ...visible, [name]: layerVisible });
  };

  const setLayerOpacity = (name, newOpacity) => {
    homeMap.setPaintProperty(name, "raster-opacity", newOpacity / 100);
    setOpacity({ ...opacity, [name]: newOpacity });
  };

  const renderControl = (name) => {
    const layerVisible = visible[name];
    return (
      <div
        key={name}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.5rem",
        }}
      >
        <div>
          <input
            checked={layerVisible}
            id={"label-" + name}
            onChange={() => setLayerVisible(name, !layerVisible)}
            type="checkbox"
            style={{ cursor: "pointer" }}
          />
          <label htmlFor={"label-" + name} style={{ cursor: "pointer", margin: "0 0 3px 0" }}>
            {layers?.[name]}
          </label>
        </div>
        <input
          max="100"
          min="0"
          onChange={(e) => setLayerOpacity(name, parseInt(e.target.value))}
          style={{ padding: "0rem", margin: "0rem", cursor: "pointer", width: "40%" }}
          type="range"
          value={opacity[name]}
        />
      </div>
    );
  };

  const renderHeading = (layers) => (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0rem" }}>
        <label style={{ fontWeight: "bold", margin: "0 .25rem 0 0" }}>{layers?.nameLabel}</label>
        <label style={{ fontWeight: "bold", margin: "0 .25rem", width: "40%" }}>
          {layers?.opacityLabel}
        </label>
      </div>
      <hr style={{ marginBottom: "0.5rem" }}></hr>
    </>
  );

  const renderNICFISection = (layers) => (
    <>
      <label style={{ fontWeight: "bold", margin: "0 .25rem 0 0" }}>{layers?.satelliteTitle}</label>
      <hr style={{ marginBottom: "0.5rem" }}></hr>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {renderControl("NICFI")}
        <NICFIControl
          extraParams={extraMapParams}
          nicfiLayers={nicfiLayers}
          setParams={setParams}
        />
      </div>
    </>
  );

  return (
    <ToolCard title={layers?.title} active={active}>
      {renderHeading(layers)}
      {opacity &&
        visible &&
        availableLayers.map((layerName) => (layerName === "NICFI" ? "" : renderControl(layerName)))}
      <br></br>
      {opacity && visible && renderNICFISection(layers)}
    </ToolCard>
  );
}

// export default class LayersPanel extends React.Component {
// constructor(props) {
//   super(props);

//   this.state = {
//     visible: null,
//     opacity: null,
//   };
// }

// componentDidMount() {
//   this.setState({
//     visible: availableLayers.reduce(
//       (acc, cur) => ({ ...acc, [cur]: startVisible.includes(cur) || false }),
//       {}
//     ),
//     opacity: availableLayers.reduce((acc, cur) => ({ ...acc, [cur]: 100 }), {}),
//   });
// }

// setVisible = (name, layerVisible) => {
//   const { visible } = this.state;
//   const { theMap } = this.props;
//   theMap.setLayoutProperty(name, "visibility", layerVisible ? "visible" : "none");
//   this.setState({ visible: { ...visible, [name]: layerVisible } });
// };

// setOpacity = (name, newOpacity) => {
//   const { opacity } = this.state;
//   const { theMap } = this.props;
//   theMap.setPaintProperty(name, "raster-opacity", newOpacity / 100);
//   this.setState({
//     opacity: { ...opacity, [name]: newOpacity },
//   });
// };

// renderControl = (name) => {
//   const { opacity, visible } = this.state;
//   const {
//     localeText: { layers },
//   } = this.context;
//   const layerVisible = visible[name];
//   return (
//     <div
//       key={name}
//       style={{
//         display: "flex",
//         justifyContent: "space-between",
//         alignItems: "center",
//         marginBottom: "0.5rem",
//       }}
//     >
//       <div>
//         <input
//           checked={layerVisible}
//           id={"label-" + name}
//           onChange={() => this.setVisible(name, !layerVisible)}
//           type="checkbox"
//           style={{ cursor: "pointer" }}
//         />
//         <label htmlFor={"label-" + name} style={{ cursor: "pointer", margin: "0 0 3px 0" }}>
//           {layers[name]}
//         </label>
//       </div>
//       <input
//         max="100"
//         min="0"
//         onChange={(e) => this.setOpacity(name, parseInt(e.target.value))}
//         style={{ padding: "0rem", margin: "0rem", cursor: "pointer", width: "40%" }}
//         type="range"
//         value={opacity[name]}
//       />
//     </div>
//   );
// };

// renderHeading = (layers) => (
//   <>
//     <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0rem" }}>
//       <label style={{ fontWeight: "bold", margin: "0 .25rem 0 0" }}>{layers.nameLabel}</label>
//       <label style={{ fontWeight: "bold", margin: "0 .25rem", width: "40%" }}>
//         {layers.opacityLabel}
//       </label>
//     </div>
//     <hr style={{ marginBottom: "0.5rem" }}></hr>
//   </>
// );

// renderNICFISection = (layers) => (
//   <>
//     <label style={{ fontWeight: "bold", margin: "0 .25rem 0 0" }}>{layers.satelliteTitle}</label>
//     <hr style={{ marginBottom: "0.5rem" }}></hr>
//     <div style={{ display: "flex", flexDirection: "column" }}>
//       {this.renderControl("NICFI")}
//       <NICFIControl
//         extraParams={this.props.extraParams}
//         nicfiLayers={this.props.nicfiLayers}
//         setParams={this.props.setParams}
//       />
//     </div>
//   </>
// );

// render() {
//   const { opacity, visible } = this.state;
//   const {
//     localeText: { layers },
//   } = this.context;
//   return (
//     <ToolCard title={layers.title}>
//       {this.renderHeading(layers)}
//       {opacity &&
//         visible &&
//         availableLayers.map((layerName) =>
//           layerName === "NICFI" ? "" : this.renderControl(layerName)
//         )}
//       <br></br>
//       {opacity && visible && this.renderNICFISection(layers)}
//     </ToolCard>
//   );
// }
// }
// LayersPanel.contextType = MainContext;
