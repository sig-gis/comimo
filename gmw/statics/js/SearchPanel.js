class SearchPanel extends React.Component {
    constructor(props) {
        super(props);

        this.URLS = {
            GEOCODE: "http://open.mapquestapi.com/geocoding/v1/address?"
        };

        this.state = {
            geoCodedSearch: null,
            selectedL1: -1,
            selectedL2: -1,
            searchText: "",
            latLngText: ""
        };
    }

    componentDidUpdate() {
        // do like other panels and refresh on open
    }

    // aipe
    searchGeocode = () => {
        const url = this.URLS.GEOCODE + "key=" + mapquestkey + "&location=" + this.state.searchText;
        fetch(url)
            .then(resp => resp.json())
            .then(result => {
                // TODO filter by exists in list.
                this.setState({
                    geoCodedSearch: result.results[0].locations.filter(l => {
                        try {
                            return l.adminArea1 === "CO"
                                && this.props.featureNames[l.adminArea3.toUpperCase()][l.adminArea4.toUpperCase()]
                                && !l.adminArea5
                                && !l.adminArea6;
                        } catch (err) {
                            return false;
                        }
                    })
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
        this.setState({searchText: value});
        if (key === "Enter") this.searchGeocode();
        // if (value) {
        //     this.searchDataset(value);
        // } else {
        //     this.clearSearchDataset();
        // }
    }

    processLatLng = () => {
        const pair = this.state.latLngText.split(",");
        const nump = pair
            .map(a => parseFloat(a))
            .slice(0, 2);
        this.props.fitMap("point", [nump[1], nump[0]]);
    };

    render() {
        const {geoCodedSearch} = this.state;
        const geoSearchResults = geoCodedSearch && geoCodedSearch.length === 0
            ? <label>No Results</label>
            : geoCodedSearch && (
                <div>{geoCodedSearch.slice(0, 3).map(item => (
                    <div
                        key={item.adminArea3}
                        className="search-results"
                        onClick={() => {
                            const state = item.adminArea3.toUpperCase();
                            const mun = item.adminArea4.toUpperCase();
                            this.setState({selectedL1: state, selectedL2: mun});
                            this.props.fitMap("bbox", this.props.featureNames[state][mun]);
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
                        onChange={e => this.setState({selectedL1: e.target.value})}
                        value={this.state.selectedL1}
                    >
                        <option key={-1} disabled value={-1}>Select a State</option>
                        {l1Names.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>
            )
            : "Loading ...";

        const activeMuns = this.props.featureNames[this.state.selectedL1] || {};
        const l2names = Object.keys(activeMuns).sort();
        const selectL2 = l2names.length > 0
            ? (
                <div className="w_100">
                    <small>Municipality</small>
                    <select
                        className="w_100"
                        onChange={e => {
                            const name = e.target.value;
                            const coords = activeMuns[name];
                            this.setState({selectedL2: name});
                            if (Array.isArray(coords)) this.props.fitMap("bbox", coords);
                            this.props.selectRegion(
                                "mun",
                                this.state.selectedL1
                                    + "_"
                                    + e.target.value
                            );
                        }}
                        value={this.state.selectedL2}
                    >
                        <option key={-1} disabled value={-1}>Select a Municipality</option>
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
                <div className="d-flex">
                    <input
                        className="w_100"
                        onChange={e => this.setState({searchText: e.target.value})}
                        onKeyUp={e => { if (e.key === "Enter") this.searchGeocode(); }}
                        value={this.state.searchText}
                    />
                    <button className="map-upd-btn" onClick={this.searchGeocode} type="button">
                        Go
                    </button>
                </div>
                {geoSearchResults}
                <label>Lat Long Search</label>
                <div className="d-flex">
                    <input
                        className="w_100"
                        onChange={e => this.setState({latLngText: e.target.value})}
                        onKeyUp={e => { if (e.key === "Enter") this.processLatLng(); }}
                        value={this.state.latLngText}
                    />
                    <button className="map-upd-btn" onClick={this.processLatLng} type="button">
                        Go
                    </button>
                </div>
                <label>Select Municipality</label>
                {selectL1}
                {selectL2}
            </div>
        );
    }
}
