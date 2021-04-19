import React from "react";

export default class LayerPanel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: null,
            opacity: null
        };
    }

    componentDidMount() {
        const {startVisible, availableLayers} = this.props;
        const layerNames = Object.keys(availableLayers);
        this.setState({
            visible: layerNames.reduce((acc, cur) => ({...acc, [cur]: startVisible.includes(cur) || false}), {}),
            opacity: layerNames.reduce((acc, cur) => ({...acc, [cur]: 100}), {})
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
        const {availableLayers} = this.props;
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
                    <label htmlFor={"label-" + name} style={{margin: "0 0 3px 0"}}>{availableLayers[name]}</label>

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
        const layerNames = Object.keys(availableLayers);

        return (
            <div className={"layer-container" + (isHidden ? " see-through" : "")}>
                <h3>SELECT LAYERS</h3>
                <div className="d-flex justify-content-between mb-2">
                    <label style={{margin: "0 .25rem"}}>Layer Name</label>
                    <div style={{width: "40%"}}>
                        <label style={{margin: "0 .25rem"}}>Opacity</label>
                    </div>
                </div>
                {opacity && visible && layerNames.map(l => this.renderControl(l))}
            </div>
        );
    }
}
