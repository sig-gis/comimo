var t;
class OuterShell extends React.Component{
  // set up class flags so each component update doesn't do redundant JS tasks
  flags = {
    updatelayers : true,
    layeradded : false
  }
  // API URLS
  URLS = {
    IMG_DATES:'/api/getimagenames',
    SINGLE_IMAGE: '/api/getsingleimage',
    COMPOSITE_IMAGE: '/api/getcompositeimage',
    LEGAL_MINES: 'api/getlegalmines',
    MUNS: 'api/getmunicipallayer'
  }
  // overall app parameters
  appparams = {
    minprobability:props.minprobability,
    maxprobability:props.maxprobability,
    minyear:props.minyear,
    maxyear:props.maxyear
  }
  // initial component states
  appstates = {
    slidershidden:true,
    statshidden:true,
    downloadhidden:true,
    subscribehidden:true,
    validatehidden:true,
    searchhidden:true,
    appinfohidden:true,
    selregionhidden:false
  }
  persistentstates = {
    showcomposite:false,
    imageDates:[],
    regionSelected:false
  }
  // combining everything to app state
  state = {...this.appparams, ...this.appstates, ...this.persistentstates}

  constructor(props){
    super(props)
  }

  // function to toggle between visible panels
  togglePanel(e, panelkey){
    document.activeElement.blur();
    var newstate = {[panelkey]:!this.state[panelkey]};
    this.setState({...this.appstates,...newstate});
  }

  imagetypechanged(){
    this.setState({showcomposite:!this.state.showcomposite})
  }

  // function to call when slider values are changed
  slidersadjusted(){
    if (this.state.showcomposite){
      var probvals = this.probSlider.getValue().split(',').map((val)=>parseInt(val));
      var yearvals = this.yearSlider.getValue().split(',');
      var newappparams = {
        minprobability:probvals[0],
        maxprobability:probvals[1],
        minyear:yearvals[0],
        maxyear:yearvals[1]
      }
      var tileURL = this.URLS.COMPOSITE_IMAGE+'?minp='+newappparams.minprobability+
                      '&maxp='+newappparams.maxprobability+
                      '&miny='+newappparams.minyear+
                      '&maxy='+newappparams.maxyear
    }else{
      var iid =document.getElementById('selectimagedate').value
      var tileURL = this.URLS.SINGLE_IMAGE+'?id='+iid
    }
    this.refreshlayers(tileURL);

  }

  getImageDates(){
    var tileURL = this.URLS.IMG_DATES;
    fetch(tileURL)
      .then(res => res.json())
      .then(
        (result) => {
          result.ids.sort();
          this.yearSlider = new rSlider({
              target: '#yearSlider',
              values:result.ids.slice(),
              step:1,
              range: true,
              scale: false,
              labels:false,
              set: [this.appparams.minyear, this.appparams.maxyear]
          });
          this.setState({imageDates:result.ids.reverse()})

          var tileURL = this.URLS.SINGLE_IMAGE+'?id='+result.ids[0]
          this.refreshlayers(tileURL)
        },
        (error) => {
          l(error);
        }
      )
  }

  pointmapto(type,arg){
    if(type == 'point') {
      try{
        this.map.flyTo({center:arg, zoom:11, essential:true});
      }catch(err){
        l('Please enter valid coordinates.')
      }
    }
    else if(type == 'bbox'){
      try{
        this.map.fitBounds(arg);
      }catch(error){
        l('Please enter valid bounds.')
      }
    }
  }

  getLegalMinesLayer(){
    fetch(this.URLS.LEGAL_MINES)
      .then(res => res.json())
      .then(
        (result) => {
          this.map.getSource('legal-mines').tiles = [result.url];
          // clear existing tile cache and force map refresh
          this.map.style.sourceCaches['legal-mines'].clearTiles()
          this.map.style.sourceCaches['legal-mines'].update(this.map.transform)
          document.getElementsByClassName("vis-legal-mines")[0].style["border"] = "solid 1px "+result.style.color;
          document.getElementsByClassName("vis-legal-mines")[0].style["background"] = result.style.fillColor;
          this.map.triggerRepaint()
        }, (error) => {
          l(error);
        }
      );
  }

  getMunicipalLayer(){
    fetch(this.URLS.MUNS)
      .then(res => res.json())
      .then(
        (result) => {
          this.map.getSource('municipalities').tiles = [result.url];
          // clear existing tile cache and force map refresh
          this.map.style.sourceCaches['municipalities'].clearTiles()
          this.map.style.sourceCaches['municipalities'].update(this.map.transform)
          document.getElementsByClassName("vis-municipalities")[0].style["border"] = "solid 1px "+result.style.color;
          this.map.triggerRepaint()
        }, (error) => {
          l(error);
        }
      );
  }

  refreshlayers(tileURL){
    fetch(tileURL)
      .then(res => res.json())
      .then(
        (result) => {
          this.map.getSource('ee-Layer').tiles = [result.url];
          // clear existing tile cache and force map refresh
          this.map.style.sourceCaches['ee-Layer'].clearTiles()
          this.map.style.sourceCaches['ee-Layer'].update(this.map.transform)
          document.getElementsByClassName("vis-ee-Layer")[0].style["background"] = '#'+result.visparams.palette[0];
          this.map.triggerRepaint()
        },
        (error) => {
          l(error);
        }
      )
  }

  regionSelected(level,name){
    this.setState({
      regionSelected:[level,name]
    });
  }
  // set up parameters after components are mounted
  componentDidMount(){
    // render maps
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/satellite-streets-v9',
      center: [-73.5609339,4.6371205],
      zoom: 5
    });

    this.map.on('load', (e) => {
      this.map.addControl(new mapboxgl.NavigationControl({showCompass:false}));
      t = this.map
      this.map.addSource("mapbox-streets", {
        "type": "raster",
        "url": "mapbox://mapbox.streets",
        "tileSize": 256
      });
      this.map.addLayer({
        'id': 'mapbox-streets',
        'type': 'raster',
        'source': 'mapbox-streets'
      });
      this.map.addSource('ee-Layer',{'type': 'raster',
        'tiles': [],
        'tileSize': 256,
        'vis': {'palette':[]}//result.visparams
      });
      this.map.addLayer({
        'id': 'ee-Layer',
        'type': 'raster',
        'source': 'ee-Layer',
        'minzoom': 0,
        'maxzoom': 22
      });
      this.map.addSource('legal-mines',{'type': 'raster',
        'tiles': [],
        'tileSize': 256,
        'vis':{'palette':[]}
      });
      this.map.addLayer({
        'id': 'legal-mines',
        'type': 'raster',
        'source': 'legal-mines',
        'minzoom': 0,
        'maxzoom': 22
      });
      this.map.addSource('municipalities',{'type': 'raster',
        'tiles': [],
        'tileSize': 256,
        'vis':{'palette':[]}
      });
      this.map.addLayer({
        'id': 'municipalities',
        'type': 'raster',
        'source': 'municipalities',
        'minzoom': 0,
        'maxzoom': 22
      });
      this.flags.layeradded = true;
      const overlays = {
        'ee-Layer': 'Prediction',
        'legal-mines': 'Legal Mining Sites',
        'municipalities': 'Municipal Boundaries',
        'mapbox-streets':'Mapbox Streets'
      }
      var opacity = new OpacityControl({
        // baseLayers:baseLayers,
        overLayers:overlays,
        opacityControl:true
      })
      this.map.addControl(opacity, 'bottom-right');
      this.getLegalMinesLayer();
      this.getMunicipalLayer();
    });
    // render sliders
    this.probSlider = new rSlider({
        target: '#probabilitySlider',
        values: {min:0, max:100},
        step:1,
        range: true,
        scale: false,
        labels:false,
        set: [this.appparams.minprobability, this.appparams.maxprobability]
    });

    this.getImageDates();
    // call initial state functions
  }

  // set up actions to render app
  render(){
    return <div className='shell' {...this.props}>
      <div ref={el => this.mapContainer = el}></div>
      <SliderPanel ishidden = {this.state.slidershidden}
        slideradjusted = {this.slidersadjusted.bind(this)}
        oncheckchange = {this.imagetypechanged.bind(this)}
        showcomposite = {this.state.showcomposite}
        imageDates = {this.state.imageDates}/>
      <StatsPanel ishidden = {this.state.statshidden} />
      <DownloadPanel ishidden = {this.state.downloadhidden} regionSelected = {this.state.regionSelected}/>
      <SubscribePanel ishidden = {this.state.subscribehidden}
        selectedRegion = {this.state.regionSelected}/>
      <ValidatePanel ishidden = {this.state.validatehidden} />
      <SearchPanel ishidden = {this.state.searchhidden}
          pointmapto={this.pointmapto.bind(this)}
          regionSelected={this.regionSelected.bind(this)}/>
      <div className='sidebar' >
        <div className='sidebar-icon gold-drop app-icon'></div>
        {/* <SideIcons parentclass='gold-drop' glyphicon='glyphicon-question-sign' />*/}
        <SideIcons
          parentclass={this.state.subscribehidden?'':'active-icon'}
          glyphicon='glyphicon-envelope'
          clickhandler={((e) => this.togglePanel(e, 'subscribehidden')).bind(this)}
          tooltip='Subscribe'/>
        <SideIcons
          parentclass={this.state.validatehidden?'':'active-icon'}
          glyphicon='glyphicon-ok'
          clickhandler={((e) => this.togglePanel(e, 'validatehidden')).bind(this)}
          tooltip='Validate'/>
        <SideIcons
          parentclass={this.state.searchhidden?'':'active-icon'}
          glyphicon='glyphicon-search'
          clickhandler={((e) => this.togglePanel(e, 'searchhidden')).bind(this)}
          tooltip='Search'/>
        <SideIcons
          parentclass={this.state.statshidden?'':'active-icon'}
          glyphicon='glyphicon-stats'
          clickhandler={((e) => this.togglePanel(e, 'statshidden')).bind(this)}
          tooltip='Stats'/>
        <SideIcons
          parentclass={this.state.slidershidden?'':'active-icon'}
          glyphicon='glyphicon-filter'
          clickhandler={((e) => this.togglePanel(e, 'slidershidden')).bind(this)}
          tooltip='Sliders'/>
        <SideIcons
          parentclass={this.state.downloadhidden?'':'active-icon'}
          glyphicon='glyphicon-download-alt'
          clickhandler={((e) => this.togglePanel(e, 'downloadhidden')).bind(this)}
          tooltip='Download data'/>

        <SideIcons
          parentclass='disclaimer'
          glyphicon='glyphicon-info-sign'
          clickhandler={((e) => this.togglePanel(e, 'appinfohidden')).bind(this)}
          tooltip='App Info'/>
      </div>
      <AppInfo ishidden={this.state.appinfohidden} onOuterClick={((e) => this.togglePanel(e, 'appinfohidden')).bind(this)}/>
    </div>
  }
};

const props = {
  minprobability:0,
  maxprobability:100,
  minyear:2000,
  maxyear:2019
};

ReactDOM.render(<OuterShell {...props}/>, document.getElementById('main-container'));
