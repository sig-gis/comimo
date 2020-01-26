class SearchPanel extends React.Component{
  URLS = {
    GEOCODE: "http://open.mapquestapi.com/geocoding/v1/address?"
  }

  constructor(props){
    super(props);
    this.state={
      geocodedsearch:[],
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

  }

  inputChanged(e){
    if (e.key == 'Enter'){
      this.searchGeocode(e.target.value);
      this.searchDataset(e.target.value);
    }
  }

  render(){
    var gsearchitems = []
    if (this.state.geocodedsearch.length>0) gsearchitems.push(<p key={-1}><b> Internet Search </b></p>);
    this.state.geocodedsearch.slice(0,2).forEach((item, i) => {
      gsearchitems.push(<li key={i} className="search-results" onClick={(e)=>{this.props.pointmapto(item.latLng.lat,item.latLng.lng)}}>
          <b> {item.adminArea1} </b> &nbsp; <i> {item.adminArea3} </i><br/>
          {item.adminArea4}&nbsp;{item.adminArea5} <br/>
          {item.latLng.lat},{item.latLng.lng}
        </li>)
    });
    var gsearchul = <ul>
      {gsearchitems}
    </ul>




    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')} style={{'top':'300px'}}>
      <input className='w_100' onKeyUp={this.inputChanged.bind(this)} />
      {gsearchul}
    </div>
  }
}
