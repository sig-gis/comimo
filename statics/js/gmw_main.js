var t;
class OuterShell extends React.Component{
  // set up class flags so each component update doesn't do redundant JS tasks
  flags = {
    updatelayers : true,
    layeradded : false
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
    apponfohidden:false
  }
  // combining everything to app state
  state = {...this.appparams, ...this.appstates}

  constructor(props){
    super(props)
  }

  // function to toggle between visible panels
  togglePanel(e, panelkey){
    document.activeElement.blur();
    var newstate = {[panelkey]:!this.state[panelkey]};
    this.setState({...this.appstates,...newstate});
  }
  // function to toggle disclaimer [WIP]
  showAppInfo(){
    l('maybe show a disclaimer modal');
  }

  // function to call when slider values are changed
  slidersadjusted(){
    var probvals = this.probSlider.getValue().split(',').map((val)=>parseInt(val));
    var yearvals = this.yearSlider.getValue().split(',').map((val)=>parseInt(val));
    var newappparams = {
      minprobability:probvals[0],
      maxprobability:probvals[1],
      minyear:yearvals[0],
      maxyear:yearvals[1]
    }
    this.refreshlayers(newappparams);
  }

  refreshlayers(appparams){
    var tileURL = '/api/test?minp='+appparams.minprobability+
                    '&maxp='+appparams.maxprobability+
                    '&miny='+appparams.minyear+
                    '&maxy='+appparams.maxyear
    fetch(tileURL)
      .then(res => res.json())
      .then(
        (result) => {
          l(result);
          if (!this.flags.layeradded){
            this.map.addSource('ee-Layer',{'type': 'raster',
              'tiles': [result.url],
              'tileSize': 256,
            });
            this.map.addLayer({
              'id': 'simple-tiles',
              'type': 'raster',
              'source': 'ee-Layer',
              'minzoom': 0,
              'maxzoom': 22
            });
            this.flags.layeradded = true;
          } else {
            t = this.map.getSource('ee-Layer')
            this.map.getSource('ee-Layer').tiles = [result.url];
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
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

    // render maps
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [-73.5609339,4.6371205],
      zoom: 5
    });

    this.map.on('load', (e) => {
      this.map.addControl(new mapboxgl.NavigationControl({showCompass:false}));
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
    this.yearSlider = new rSlider({
        target: '#yearSlider',
        values: {min:2000, max:2019},
        step:1,
        range: true,
        scale: false,
        labels:false,
        set: [this.appparams.minyear, this.appparams.maxyear]
    });

    // call initial state functions
    this.refreshlayers(this.appparams);
  }

  // set up actions to render app
  render(){
    return <div className='shell' {...this.props}>
      <div ref={el => this.mapContainer = el}></div>
      <SliderPanel ishidden = {this.state.slidershidden} slideradjusted = {this.slidersadjusted.bind(this)} />
      <StatsPanel ishidden = {this.state.statshidden} />
      <DownloadPanel ishidden = {this.state.downloadhidden} />
      <SubscribePanel ishidden = {this.state.subscribehidden} />
      <ValidatePanel ishidden = {this.state.validatehidden} />
      <SearchPanel ishidden = {this.state.searchhidden} />
      <div className='sidebar' >
        <SideIcons parentclass='gold-drop' glyphicon='glyphicon-question-sign' />
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
