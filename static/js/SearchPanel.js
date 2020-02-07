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
    }
    if (e.target.value){
      this.searchDataset(e.target.value);
    }else{
      this.clearSearchDataset();
    }
  }

  latlngChanged(e, f){
    if (e.key == 'Enter'){
      var pair = e.target.value.split(',');
      var nump = pair.map((a)=>{return parseInt(a)}).slice(0,2);
      f('point',[nump[1],nump[0]])
    }
  }


  getFeatureNames(){
    fetch(this.URLS.FEATURE_NAMES)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            featureNames:result.l2.sort((a,b)=>{
              return (a[0]>b[0])?1:-1;
            })
          })
        }, (error) => {
          l(error)
        }
      );
  }

  munSelected(e,f){
    if(e.target.value === 0) return;
    var coords = e.target.value.split(',');
    f('bbox',[[coords[0],coords[1]],[coords[2],coords[3]]]);
  }

  componentDidMount(){
    this.getFeatureNames();
  }

  render(){
    var gsearchitems = []
    this.state.geocodedsearch.slice(0,2).forEach((item, i) => {
      gsearchitems.push(
        <li key={i}
          className="search-results"
          onClick={(e)=>{this.props.pointmapto('point',[item.latLng.lng,item.latLng.lat])}}>
          <b> {item.adminArea1} </b> &nbsp; <i> {item.adminArea3} </i><br/>
          {item.adminArea4}&nbsp;{item.adminArea5} <br/>
          {item.latLng.lat},{item.latLng.lng}
        </li>)
    });
    var gsearchul = <ul>
      {gsearchitems}
    </ul>

    var selectMun = []
    if (this.state.featureNames.length==0) selectMun.push(<option key={-1}>Loading Municipalities</option>);
    else{selectMun.push(<option key={-1} value={0} disabled>Select a Municipality</option>)}
    this.state.featureNames.forEach((item, i) => {
      selectMun.push(<option key={i} value={item[1]}>
        {item[0]}
      </option>);
    });

    var selectInput = <select className='w_100' onChange={(e) => {this.munSelected(e,this.props.pointmapto)}}>
      {selectMun}
    </select>

    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')} style={{'top':'150px'}}>
      <b>SEARCH LOCATION</b><br/>
      <b>Internet Search</b>
      <input className='w_100' onKeyUp={this.inputChanged.bind(this)} />
      {gsearchul}
      <b>Lat Long Search</b>
      <input className='w_100' onKeyUp={(e) => {this.latlngChanged(e,this.props.pointmapto)}} />
      <b>Select Municipality</b>
      {selectInput}
    </div>
  }
}
