class SearchPanel extends React.Component{
  URLS = {
    GEOCODE: "http://open.mapquestapi.com/geocoding/v1/address?",
    FEATURE_NAMES: 'api/getfeaturenames',
    PERU_F_NAMES: 'api/getperufnames'
  }

  constructor(props){
    super(props);
    this.state={
      geocodedsearch:[],
      featureNames:{},
      activel1:false,
      activeMuns:{},
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
    var mapped = this.props.featureNames.filter(feat => feat[0].toUpperCase().match(regexp));
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

  stateSelected(e){
    this.setState({
      activel1:e.target.value,
      activeMuns:this.props.featureNames[e.target.value]
    });
  }

  munSelected(e,f){
    if(e.target.value === 0) return;
    var coords = e.target.value.split(',');
    f('bbox',[[coords[0],coords[1]],[coords[2],coords[3]]]);
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

    var selectl1='Loading ...', selectl2='';
    var l1names = Object.keys(this.props.featureNames).sort();
    if (l1names.length > 0){
      var selectl1options = [<option key={-1} value={0} disabled>Select a State</option>];
      l1names.forEach((item, i) => {
        selectl1options.push(<option key={i} value={item}>
          {item}
        </option>);
      });
      selectl1 = <div className="w_100">
        <small>State</small>
        <select className='w_100' defaultValue={0} onChange={this.stateSelected.bind(this)}>
          {selectl1options}
        </select>
      </div>
    }
    var l2objects = this.state.activeMuns;
    var l2names = Object.keys(l2objects).sort()
    if (l2names.length>0){
      var selectl2options = [<option key={-1} value={0} disabled>Select a Municipality</option>];
      l2names.forEach((item, i) => {
        selectl2options.push(<option key={i} value={l2objects[item]} name={item}>
          {item}
        </option>)
      });
      selectl2 = <div className="w_100">
        <small>Municipality</small>
        <select className='w_100' defaultValue={0} onChange={(e) => {
            console.log(this.state.activel1+'_'+e.target.selectedOptions[0].getAttribute('name'))
              this.munSelected(e,this.props.pointmapto);
              this.props.regionSelected('mun',this.state.activel1+'_'+e.target.selectedOptions[0].getAttribute('name'));
            }}
          >
          {selectl2options}
        </select>
      </div>
    }


    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')} style={{'top':'150px'}}>
      <b>SEARCH LOCATION</b><br/>
      <b>Internet Search</b>
      <input className='w_100' onKeyUp={this.inputChanged.bind(this)} />
      {gsearchul}
      <b>Lat Long Search</b>
      <input className='w_100' onKeyUp={(e) => {this.latlngChanged(e,this.props.pointmapto)}} />
      <b>Select Municipality</b><br/>
      {selectl1}
      {selectl2}
    </div>
  }
}
