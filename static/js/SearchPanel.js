class SearchPanel extends React.Component{
  URLS = {
    GEOCODE: "http://open.mapquestapi.com/geocoding/v1/address?",
    FEATURE_NAMES: 'api/getfeaturenames'
  }

  constructor(props){
    super(props);
    this.state={
      geocodedsearch:[],
      featureNames:[],
      datasetsearch:[]
    }
  }

  searchGeocode(searchString){
    var url = this.URLS.GEOCODE+'key='+mapquestkey+'&location='+searchString
    fetch(url).then(resp => resp.json()).
    then((result) => {
      this.setState({geocodedsearch:result.results[0].locations});
    },(error) => {
      l(error);
    })
  }

  searchDataset(searchString){
    var regexp = new RegExp('^'+searchString.toUpperCase()+'[A-Z]*');
    var mapped = this.state.featureNames.filter(feat => feat[0].toUpperCase().match(regexp));
    this.setState({
      datasetsearch:mapped.sort()
    });
  }

  clearSearchDataset(){
    this.setState({
      datasetsearch:[]
    });
  }

  inputChanged(e){
    if (e.key == 'Enter'){
      this.searchGeocode(e.target.value);
      this.searchDataset(e.target.value);
    }
    if (e.target.value){
      this.searchDataset(e.target.value);
    }else{
      this.clearSearchDataset();
    }
  }

  getFeatureNames(){
    fetch(this.URLS.FEATURE_NAMES)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            featureNames:result.l2
          })
        }, (error) => {
          l(error)
        }
      );
  }

  componentDidMount(){
    this.getFeatureNames();
  }

  render(){
    var gsearchitems = []
    if (this.state.geocodedsearch.length>0) gsearchitems.push(<p key={-1}><b> Internet Search </b></p>);
    this.state.geocodedsearch.slice(0,2).forEach((item, i) => {
      gsearchitems.push(
        <li key={i}
          className="search-results"
          onClick={(e)=>{this.props.pointmapto('point',[item.latLng.lat,item.latLng.lng])}}>
          <b> {item.adminArea1} </b> &nbsp; <i> {item.adminArea3} </i><br/>
          {item.adminArea4}&nbsp;{item.adminArea5} <br/>
          {item.latLng.lat},{item.latLng.lng}
        </li>)
    });
    var gsearchul = <ul>
      {gsearchitems}
    </ul>

    var dsearchitems = []
    if (this.state.datasetsearch.length>0) dsearchitems.push(<p key={-1}><b> Municipality Search </b></p>);
    this.state.datasetsearch.slice(0,5).forEach((item, i) => {
      dsearchitems.push(<li key={i}
        className="search-results"
        onClick={(e)=>{this.props.pointmapto('bbox',item[1])}}>
          {item[0]}
        </li>)
    });
    var dsearchul = <ul>
      {dsearchitems}
    </ul>

    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')} style={{'top':'150px'}}>
      <input className='w_100' onKeyUp={this.inputChanged.bind(this)} />
      {gsearchul}
      {dsearchul}
    </div>
  }
}
