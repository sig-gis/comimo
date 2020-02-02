class LevelControl {

  onAdd(map){
    this.map = map;
    this.container = document.createElement('div'); this.container.className= 'mapboxgl-ctrl mapboxgl-ctrl-group';
    this.zoomIn = document.createElement('button');
      this.zoomIn.className = 'mapboxgl-ctrl-zoom-in';
      this.zoomIn.type = 'button';
      this.zoomIn.style = 'text-align:center;font-size:15px';
      var inspan = document.createElement('span');
      inspan.className = 'glyphicon glyphicon-zoom-in';
      this.zoomIn.appendChild(inspan)
      this.zoomIn.onclick = map.bindDeeper;

    this.zoomOut = document.createElement('button');
      this.zoomOut.className = 'mapboxgl-ctrl-zoom-out';
      this.zoomOut.type = 'button';
      this.zoomOut.style = 'text-align:center;font-size:15px';
      var outspan = document.createElement('span');
      outspan.className = 'glyphicon glyphicon-zoom-out';
      this.zoomOut.appendChild(outspan);
      this.zoomOut.onclick = map.bindShallower;

    this.container.appendChild(this.zoomIn);
    this.container.appendChild(this.zoomOut);

    return this.container;
  }
  onRemove(){
    this.container.parentNode.removeChild(this.container);
    this.map = undefined;
  }
}

<div class="mapboxgl-ctrl mapboxgl-ctrl-group">
  <button class="mapboxgl-ctrl-zoom-in" type="button" title="Zoom in" aria-label="Zoom in">
    <span class="mapboxgl-ctrl-icon" aria-hidden="true"></span>
  </button>
  <button class="mapboxgl-ctrl-zoom-out" type="button" title="Zoom out" aria-label="Zoom out">
    <span class="mapboxgl-ctrl-icon" aria-hidden="true"></span>
  </button>
</div>




class SubscribedList extends React.Component{
  URLS = {
    getsubs : '/subscribe/getsubs',
    addsubs : '/subscribe/addsubs',
    delsubs : '/subscribe/delsubs',
    getfeatlist : '/api/getfeaturenames',
    getfeats : '/api/getfeatures'
  }
  appdefaults = {
    l0active:true,
    l1active:false,
    l2active:false
  }
  mapContainer = 'map';

  activelayer;
  selectedfeature;
  currentlevel = 0;

  constructor(props){
    super (props)
    this.state = {
      list:props.list,
      l0: props.l0,
      l1: props.l1,
      l2: props.l2,
      selectedfeature: props.selectedfeature,
      ...this.appdefaults
    }
  }

  // set up parameters after components are mounted
  componentDidMount(){
    console.log(this.props.list);
    this.getSubList();
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';
    // render maps
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [-73.5609339,4.6371205],
      zoom: 5
    });

    this.map.on('load', (e) => {
      this.map.bindDeeper = (e)=>{this.goDeeper(e)}
      this.map.bindShallower = (e)=>{this.goShallower(e)}
      this.map.addControl(new mapboxgl.NavigationControl({showCompass:false}));
      const levelcontrol = new LevelControl();
      this.map.addControl(levelcontrol);
    });

    this.getFeatures(0);
  }

  goDeeper(e){
    if (this.currentlevel < 2){
      if(this.selectedfeature){
        var region = document.getElementById('regionBox').value;
        this.map.setFeatureState({source:'activelayer', id:this.selectedfeature.id},{clicked:false})
        this.selectedfeature = '';
        this.setState({selectedfeature:''})
        this.getFeatures(this.currentlevel+1, region);
      }
    }
  }

  goShallower(e){
    if (this.currentlevel > 0){
      if(this.selectedfeature){
        this.map.setFeatureState({source:'activelayer', id:this.selectedfeature.id},{clicked:false})
      }
      this.selectedfeature = '';
      this.setState({selectedfeature:''})
      this.getFeatures(this.currentlevel-1);
    }
  }

  createList(list){
    var ul = [];
    for (let i = 0; i < list.length; i++) {
      ul.push(<li key={i}>
        {list[i]}
        &nbsp;&nbsp;&nbsp;<input type="submit" value="X" data={list[i]} className="del-btn" title="delete" onClick={(e)=>this.delSubs(e, list[i])}/>
      </li>);
    }
    return ul;
  }

  getFeatures(level, region){
    fetch(this.URLS.getfeats+'?level='+level+'&focus='+region).then(res => res.json())
    .then(
      (result) => {
        this.selectedfeature = '';
        this.setState({selectedfeature:''});
        if (this.activelayer) {
          this.map.getSource('activelayer').setData(result);
        }else{
          this.activelayer = {
            'id': 'activelayer',
            'type': 'fill',
            'source': {
              'type': 'geojson',
              'data': result
            },
            'paint': {
              'fill-color': '#088',
              'fill-opacity': ['case',['boolean',['feature-state', 'clicked'], false], 0.8, 0.4]
            }
          };
          this.map.addLayer(this.activelayer);
          this.map.on('click','activelayer', (e)=>{this.selectFeature(e, this.map)});
        }
        this.currentlevel = level;
      },
      (error) => {
        l(error);
      }
    )
  }

  selectFeature(e, map){
    if (e.features.length>0){
      var columnName = 'admin0Name';
      if (this.currentlevel == 1) columnName = 'admin1RefN';
      if (this.currentlevel == 2) columnName = 'admin2RefN';
      if (this.selectedfeature){
        map.setFeatureState({source:'activelayer', id:this.selectedfeature.id},{clicked:false})
      }
      this.selectedfeature = e.features[0];
      map.setFeatureState({source:'activelayer', id:this.selectedfeature.id},{clicked:true})
      var pr = this.selectedfeature.properties;
      this.setState({selectedfeature:pr[columnName]})
    }
  }

  getSubList(){
    fetch(this.URLS.getsubs).then(res => res.json())
    .then(
      (result) => {
        if (result.action != 'Error') this.setState({list:result['regions'].sort()})
      },
      (error) => {
        l(error);
      }
    )
  }


  delSubs(e, data){
    fetch(this.URLS.delsubs+'?region='+data+'&level='+this.currentlevel).then(res => res.json())
    .then(
      (result) => {
        if (result.action != 'Error') {
          var currentList = this.state.list;
          currentList.splice(currentList.indexOf(result.region),1)
          this.setState({
            list: currentList
          });
        }
      },
      (error) => {
        l(error);
      }
    )
  }

  addSubs(e){
    var region = document.getElementById('regionBox').value
    if (region != ''){
      fetch(this.URLS.addsubs+'?region='+region+'&level='+this.currentlevel).then(res => res.json())
      .then(
        (result) => {
          if (result.action == 'Created') {
            var currentList = this.state.list;
            currentList.push(result.region);
            currentList.sort();
            this.setState({
              list: currentList
            });
          } else if (result.action == 'Exists'){
            alert('You are already subscribed to the region!');
          }
        },
        (error) => {
          l(error);
        }
      )
    }
  }

  render(){
    var list = <div></div>
    if (this.state.list.length == 0){
      list = <div className="subs-header"> You don't seem to be subscribed to alerts from any region! </div>
    }
    else{
      list = <div>
        <div className="subs-header"> You are subscribed to alerts from following regions</div>
        <ul> {this.createList(this.state.list)} </ul>
        <br/>
      </div>
    }
    var form = <form action='' className="form-horizontal">
      <label>Subscribe to a new region!</label><br/>
      <div id='map'>
      </div>
      <input type="text" id="regionBox" name="region" className="form-control"
        placeholder="Select a region on map"
        value={this.state.selectedfeature} required disabled></input><br/>
      <input type='submit' value="Subscribe" className="btn btn-primary btn-sm" onClick={(e)=>{e.preventDefault();this.addSubs(e);}}></input>
    </form>

    return <div>
      {list}
      {form}
    </div>
  }
}
const props = {list:[],l0:'',l1:[],l2:[],selectedfeature:''};
ReactDOM.render(<SubscribedList {...props}/>, document.getElementById('subs-list'));
