// デフォルトオプション設定
const defaultOptions = {
    baseLayers: null,
    overLayers: null,
    visibleOverlays: [],
    opacityControl: false
};

class OpacityControl {
    constructor(options) {
        this._overLayersOption = options.overLayers || defaultOptions.overLayers;
        this._visibleOverlaysOption = options.visibleOverlays || defaultOptions.visibleOverlays;
        this._opacityControlOption = options.opacityControl || defaultOptions.opacityControl;
        this._expanded = false;
    }

    _checkBoxControlAdd(layerId) {
        const element = document.createElement("div");
        const checkBox = document.createElement("input");
        checkBox.setAttribute("type", "checkbox");
        checkBox.id = layerId;
        if (this._visibleOverlaysOption.includes(layerId)) {
            this._map.setLayoutProperty(layerId, "visibility", "visible");
            checkBox.setAttribute("checked", true);
        } else {
            this._map.setLayoutProperty(layerId, "visibility", "none");
        }
        element.appendChild(checkBox);

        checkBox.addEventListener("change", event => {
            const ckFlag = event.target.checked;
            if (ckFlag) {
                this._map.setLayoutProperty(layerId, "visibility", "visible");
            } else {
                this._map.setLayoutProperty(layerId, "visibility", "none");
            }
        });

        const layerName = document.createElement("span");
        layerName.appendChild(document.createTextNode(this._overLayersOption[layerId]));
        const vis = this._map.getSource(layerId)._options.vis;
        if (vis) {
            const icon = document.createElement("span");
            icon.className = "legend-icon vis-" + layerId;
            icon.style = "background:#" + vis.palette[0];
            element.appendChild(icon);
        }
        element.appendChild(layerName);
        return element;
    }

    _rangeControlAdd(layerId) {
        const element = document.createElement("div");
        const range = document.createElement("input");
        range.type = "range";
        range.min = 0;
        range.max = 100;
        range.value = 100;
        element.appendChild(range);

        range.addEventListener("input", event => {
            const rgValue = event.target.value;
            this._map.setPaintProperty(layerId, "raster-opacity", Number(rgValue / 100));
        });
        return element;
    }

    _opacityControlAdd() {
        this._container = document.createElement("div");
        this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
        this._container.id = "opacity-control";

        const expandDiv = document.createElement("div");
        expandDiv.className = "expand-legend-div";

        const expandBtn = document.createElement("button");
        expandBtn.style.width = "calc(100% - 10px)";

        const expandTxt = document.createElement("span");
        expandTxt.id = "expand-legend-txt";
        expandTxt.innerHTML = "Show layer list";

        expandBtn.appendChild(expandTxt);

        expandBtn.onclick = () => {
            const legend = document.getElementById("legend-div");
            const text = document.getElementById("expand-legend-txt");
            this._expanded = !this._expanded;
            legend.style.display = this._expanded ? "block" : "none";
            text.innerHTML = this._expanded ? "Hide layer list" : "Show layer list";
        };

        expandDiv.appendChild(expandBtn);

        const legendDiv = document.createElement("div");
        legendDiv.id = "legend-div";
        legendDiv.style.display = this._expanded ? "block" : "none";

        if (this._overLayersOption !== null) {
            Object.keys(this._overLayersOption).forEach(layer => {
                const layerId = layer;
                legendDiv.appendChild(this._checkBoxControlAdd(layerId));
                if (this._opacityControlOption) {
                    legendDiv.appendChild(this._rangeControlAdd(layerId));
                }
            });
        }
        this._container.appendChild(expandDiv);
        this._container.appendChild(legendDiv);
    }

    onAdd(map) {
        this._map = map;
        this._opacityControlAdd();
        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}
