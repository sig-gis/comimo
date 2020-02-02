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
    COMPOSITE_IMAGE: '/api/getcompositeimage'
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
    appinfohidden:true
  }
  persistentstates = {
    showcomposite:false,
    imageDates:[]
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

  pointmapto(lat,lng){
    this.map.flyTo({center:[lng, lat], zoom:11, essential:true});
  }

  refreshlayers(tileURL){
    fetch(tileURL)
      .then(res => res.json())
      .then(
        (result) => {
          if (!this.flags.layeradded){
            this.map.addSource('ee-Layer',{'type': 'raster',
              'tiles': [result.url],
              'tileSize': 256,
              'vis': result.visparams
            });
            this.map.addLayer({
              'id': 'ee-Layer',
              'type': 'raster',
              'source': 'ee-Layer',
              'minzoom': 0,
              'maxzoom': 22
            });
            this.flags.layeradded = true;
            const overlays = {
              'ee-Layer': 'Prediction',
              'mapbox-streets':'Mapbox Streets'
            }
            var opacity = new OpacityControl({
              // baseLayers:baseLayers,
              overLayers:overlays,
              opacityControl:true
            })
            this.map.addControl(opacity, 'bottom-right')

          } else {
            t = this.map//.getSource('ee-Layer')
            this.map.getSource('ee-Layer').tiles = [result.url];
            // clear existing tile cache and force map refresh
            this.map.style.sourceCaches['ee-Layer'].clearTiles()
            this.map.style.sourceCaches['ee-Layer'].update(this.map.transform)
            this.map.triggerRepaint()
          }
        },
        (error) => {
          l(error);
        }
      )
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
          imageDates = {this.state.imageDates}
          />
      <StatsPanel ishidden = {this.state.statshidden} />
      <DownloadPanel ishidden = {this.state.downloadhidden} />
      <SubscribePanel ishidden = {this.state.subscribehidden} />
      <ValidatePanel ishidden = {this.state.validatehidden} />
      <SearchPanel ishidden = {this.state.searchhidden}
          pointmapto={this.pointmapto.bind(this)}/>
      <div className='sidebar' >
        <div className='sidebar-icon gold-drop app-icon'></div>
        {/* <SideIcons parentclass='gold-drop' glyphicon='glyphicon-question-sign' />*/}
        <SideIcons
          parentclass={this.state.slidershidden?'':'active-icon'}
          glyphicon='glyphicon-globe'
          clickhandler={((e) => this.togglePanel(e, 'slidershidden')).bind(this)}
          tooltip='Sliders'/>
        <SideIcons
          parentclass={this.state.statshidden?'':'active-icon'}
          glyphicon='glyphicon-stats'
          clickhandler={((e) => this.togglePanel(e, 'statshidden')).bind(this)}
          tooltip='Stats'/>
        <SideIcons
          parentclass={this.state.downloadhidden?'':'active-icon'}
          glyphicon='glyphicon-download-alt'
          clickhandler={((e) => this.togglePanel(e, 'downloadhidden')).bind(this)}
          tooltip='Download data'/>
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
