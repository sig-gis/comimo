// デフォルトオプション設定
const defaultOptions = {
  baseLayers: null,
  overLayers: null,
  opacityControl: false,
};

class OpacityControl {
  constructor(options) {
    // オプション設定
    this._baseLayersOption = options.baseLayers || defaultOptions.baseLayers;
    this._overLayersOption = options.overLayers || defaultOptions.overLayers;
    this._opacityControlOption = options.opacityControl || defaultOptions.opacityControl;
    this._expanded = false;
  }

  // ラジオボタン作成
  _radioButtonControlAdd(layerId) {
    // ラジオボタン追加
    var element = document.createElement("div");

    const radioButton = document.createElement("input");
    radioButton.setAttribute("type", "radio");
    radioButton.id = layerId;
    // 初期レイヤのみ表示
    if (layerId === Object.keys(this._baseLayersOption)[0]) {
      radioButton.checked = true;
      this._map.setLayoutProperty(layerId, "visibility", "visible");
    } else {
      this._map.setLayoutProperty(layerId, "visibility", "none");
    }
    element.appendChild(radioButton);

    // ラジオボタンイベント
    radioButton.addEventListener("change", event => {
      // 選択レイヤ表示
      event.target.checked = true;
      this._map.setLayoutProperty(layerId, "visibility", "visible");
      // 選択レイヤ以外非表示
      Object.keys(this._baseLayersOption).forEach(layer => {
        if (layer !== event.target.id) {
          document.getElementById(layer).checked = false;
          this._map.setLayoutProperty(layer, "visibility", "none");
        }
      });
    });

    // レイヤ名追加
    const layerName = document.createElement("span");
    layerName.appendChild(document.createTextNode(this._baseLayersOption[layerId]));
    element.appendChild(layerName);
    return element;
  }

  // チェックボックス作成
  _checkBoxControlAdd(layerId) {
    var element = document.createElement("div");
    // チェックボックス追加
    const checkBox = document.createElement("input");
    checkBox.setAttribute("type", "checkbox");
    checkBox.id = layerId;
    // 全レイヤ非表示
    this._map.setLayoutProperty(layerId, "visibility", "none");
    element.appendChild(checkBox);

    // チェックボックスイベント
    checkBox.addEventListener("change", event => {
      const ckFlag = event.target.checked;
      // レイヤの表示・非表示
      if (ckFlag) {
        this._map.setLayoutProperty(layerId, "visibility", "visible");
      } else {
        this._map.setLayoutProperty(layerId, "visibility", "none");
      }
    });

    // レイヤ名追加

    const layerName = document.createElement("span");
    layerName.appendChild(document.createTextNode(this._overLayersOption[layerId]));
    var vis = this._map.getSource(layerId)._options.vis;
    if (vis) {
      const icon = document.createElement("span");
      icon.className = "legend-icon vis-" + layerId;
      icon.style = "background:#" + vis.palette[0];
      element.appendChild(icon);
    }
    element.appendChild(layerName);
    return element;
  }

  // スライドバー作成
  _rangeControlAdd(layerId) {
    var element = document.createElement("div");
    // スライドバー追加
    const range = document.createElement("input");
    range.type = "range";
    range.min = 0;
    range.max = 100;
    range.value = 100;
    element.appendChild(range);

    // スライドバースイベント
    range.addEventListener("input", event => {
      const rgValue = event.target.value;
      // 透過度設定
      this._map.setPaintProperty(layerId, "raster-opacity", Number(rgValue / 100));
    });
    return element;
  }

  // コントロール作成
  _opacityControlAdd() {
    // コントロール設定
    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    this._container.id = "opacity-control";

    var expandDiv = document.createElement("div");
    expandDiv.className = "expand-legend-div";

    var expandBtn = document.createElement("button");
    expandBtn.style.width = "calc(100% - 10px)";

    var expandIco = document.createElement("span");
    expandIco.id = "expand-legend-ico";
    expandIco.className = "glyphicon glyphicon-plus";
    var expandTxt = document.createElement("span");
    expandTxt.innerHTML = " Legend";

    expandBtn.appendChild(expandIco);
    expandBtn.appendChild(expandTxt);

    expandBtn.onclick = e => {
      var legend = document.getElementById("legend-div");
      var ico = document.getElementById("expand-legend-ico");
      this._expanded = !this._expanded;
      legend.style.display = this._expanded ? "block" : "none";
      var glyphclass = this._expanded ? "glyphicon-minus" : "glyphicon-plus";
      ico.className = "glyphicon " + glyphclass;
    };

    expandDiv.appendChild(expandBtn);

    var legendDiv = document.createElement("div");
    legendDiv.id = "legend-div";
    legendDiv.style.display = this._expanded ? "block" : "none";

    // 背景レイヤ設定
    if (this._baseLayersOption !== null) {
      Object.keys(this._baseLayersOption).forEach(layer => {
        const layerId = layer;
        // ラジオボタン作成
        legendDiv.appendChild(this._radioButtonControlAdd(layerId));
      });
    }

    // 区切り線
    if (this._baseLayersOption !== null && this._overLayersOption !== null) {
      const hr = document.createElement("hr");
      legendDiv.appendChild(hr);
    }

    // オーバーレイヤ設定
    if (this._overLayersOption !== null) {
      Object.keys(this._overLayersOption).forEach(layer => {
        const layerId = layer;
        // チェックボックス作成
        legendDiv.appendChild(this._checkBoxControlAdd(layerId));
        // スライドバー作成
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
    // コントロール作成
    this._opacityControlAdd();
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}
