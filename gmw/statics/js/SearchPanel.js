class SearchPanel extends React.Component {
    constructor(props) {
        super(props);

        this.URLS = {
            GEOCODE: "http://open.mapquestapi.com/geocoding/v1/address?"
        };

        this.state = {
            geoCodedSearch: [],
            activeL1: false
            // dataSetSearch: []
        };
    }

    searchGeocode = searchString => {
        const url = this.URLS.GEOCODE + "key=" + mapquestkey + "&location=" + searchString;
        fetch(url)
            .then(resp => resp.json())
            .then(result => {
                this.setState({
                    geoCodedSearch: result.results[0].locations.filter(l => l.adminArea1 === "CO"
                        && l.adminArea3
                        && l.adminArea4
                        && !l.adminArea5
                        && !l.adminArea6)
                });
            })
            .catch(error => console.log(error));
    };

    // This is incomplete
    // searchDataset(searchString) {
    //     const regexp = new RegExp("^" + searchString.toUpperCase() + "[A-Z]*");
    //     const mapped = this.props.featureNames.filter(feat => feat[0].toUpperCase().match(regexp));
    //     this.setState({
    //         dataSetSearch: mapped.sort()
    //     });
    // }

    // clearSearchDataset() {
    //     this.setState({
    //         dataSetSearch: [],
    //         geoCodedSearch: []
    //     });
    // }

    inputChanged(key, value) {
        if (key === "Enter") {
            this.searchGeocode(value);
        }
        // if (value) {
        //     this.searchDataset(value);
        // } else {
        //     this.clearSearchDataset();
        // }
    }

    latLngChanged = (key, value) => {
        if (key === "Enter") {
            const pair = value.split(",");
            const nump = pair
                .map(a => parseFloat(a))
                .slice(0, 2);
            this.props.fitMap("point", [nump[1], nump[0]]);
        }
    };

    stateSelected(value) {
        this.setState({activeL1: value});
    }

    render() {
        const geoSearchResults = (
            <div>{this.state.geoCodedSearch.slice(0, 3).map(item => (
                <div
                    key={item.adminArea3}
                    className="search-results"
                    onClick={() => {
                        this.props.fitMap("point", [item.latLng.lng, item.latLng.lat]);
                        this.props.selectRegion(
                            "mun",
                            item.adminArea3.toUpperCase()
                                + "_"
                                + item.adminArea4.toUpperCase()
                        );
                    }}
                    style={{display: "flex", flexDirection: "column"}}
                >
                    <span><b>{item.adminArea1}</b>&nbsp;<i>{item.adminArea4}, {item.adminArea3}</i></span>
                    <span>{item.latLng.lat},{item.latLng.lng}</span>
                </div>
            ))}
            </div>
        );

        const l1Names = Object.keys(this.props.featureNames).sort() || [];
        const selectL1 = l1Names.length > 0
            ? (
                <div className="w_100">
                    <small>State</small>
                    <select
                        className="w_100"
                        defaultValue={0}
                        onChange={e => this.stateSelected(e.target.value)}
                    >
                        <option key={-1} disabled value={0}>Select a State</option>
                        {l1Names.map(item => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </div>
            )
            : "Loading ...";

        const activeMuns = this.props.featureNames[this.state.activeL1] || {};
        const l2names = Object.keys(activeMuns).sort();
        const selectL2 = l2names.length > 0
            ? (
                <div className="w_100">
                    <small>Municipality</small>
                    <select
                        className="w_100"
                        defaultValue={0}
                        onChange={e => {
                            const name = e.target.value;
                            const coords = activeMuns[name];
                            if (Array.isArray(coords)) this.props.fitMap("bbox", coords);
                            this.props.selectRegion(
                                "mun",
                                this.state.activeL1
                                    + "_"
                                    + e.target.value
                            );
                        }}
                    >
                        <option key={-1} disabled value={0}>Select a Municipality</option>
                        {l2names.map(item => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </div>
            ) : "";

        return (
            <div className={"popup-container search-panel " + (this.props.isHidden ? "see-through" : "")}>
                <h3>SEARCH LOCATION</h3>
                <label>Internet Search</label>
                <input className="w_100" onKeyUp={e => this.inputChanged(e.key, e.target.value)}/>
                {geoSearchResults}
                <label>Lat Long Search</label>
                <input className="w_100" onKeyUp={e => this.latLngChanged(e.key, e.target.value)}/>
                <label>Select Municipality</label>
                {selectL1}
                {selectL2}
            </div>
        );
    }
}
