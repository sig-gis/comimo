
class OuterShell extends React.Component{
  appparams = {
    minprobability:props.minprobability,
    maxprobability:props.maxprobability,
    minyear:props.minyear,
    maxyear:props.maxyear
  }
  appstates = {
    slidershidden:true,
    statshidden:true,
    downloadhidden:true,
    subscribehidden:true,
    validatehidden:true,
    searchhidden:true
  }
  state = {...this.appparams, ...this.appstates}

  constructor(props){
    super(props)
  }

  showSliders(){
    document.activeElement.blur();
    var newstate = {slidershidden:!this.state.slidershidden};
    this.setState({...this.appstates,...newstate});
  }
  showStats(){
    document.activeElement.blur();
    var newstate = {statshidden:!this.state.statshidden};
    this.setState({...this.appstates,...newstate});
  }
  showDownload(){
    document.activeElement.blur();
    var newstate = {downloadhidden:!this.state.downloadhidden};
    this.setState({...this.appstates,...newstate});
  }
  showSubscribe(){
    document.activeElement.blur();
    var newstate = {subscribehidden:!this.state.subscribehidden};
    this.setState({...this.appstates,...newstate});
  }
  showValidate(){
    document.activeElement.blur();
    var newstate = {validatehidden:!this.state.validatehidden};
    this.setState({...this.appstates,...newstate});
  }
  showSearch(){
    document.activeElement.blur();
    var newstate = {searchhidden:!this.state.searchhidden};
    this.setState({...this.appstates,...newstate});
  }
  showDisclaimer(){
    document.activeElement.blur();
    var newstate = {disclaimerhidden:!this.state.disclaimerhidden};
    this.setState({...this.appstates,...newstate});
  }

  slidersadjusted(){
    console.log("sliders adjusted");
  }

  render(){
    return <div className='shell' {...this.props}>
      <GoldMap />
      <SliderPanel ishidden = {this.state.slidershidden}/>
      <StatsPanel ishidden = {this.state.statshidden} />
      <DownloadPanel ishidden = {this.state.downloadhidden} />
      <SubscribePanel ishidden = {this.state.subscribehidden} />
      <ValidatePanel ishidden = {this.state.validatehidden} />
      <SearchPanel ishidden = {this.state.searchhidden} />
      <div className='sidebar' >
        <SideIcons parentclass='gold-drop' glyphicon='glyphicon-question-sign' />
        <SideIcons
          parentclass={this.state.slidershidden?'':'active-icon'}ß
          glyphicon='glyphicon-globe'
          clickhandler={this.showSliders.bind(this)}
          tooltip='Sliders'/>
        <SideIcons
          parentclass={this.state.statshidden?'':'active-icon'}ß
          glyphicon='glyphicon-stats'
          clickhandler={this.showStats.bind(this)}
          tooltip='Stats'/>
        <SideIcons
          parentclass={this.state.downloadhidden?'':'active-icon'}ß
          glyphicon='glyphicon-download-alt'
          clickhandler={this.showDownload.bind(this)}
          tooltip='Download data'/>
        <SideIcons
          parentclass={this.state.subscribehidden?'':'active-icon'}ß
          glyphicon='glyphicon-envelope'
          clickhandler={this.showSubscribe.bind(this)}
          tooltip='Subscribe'/>
        <SideIcons
          parentclass={this.state.validatehidden?'':'active-icon'}ß
          glyphicon='glyphicon-ok'
          clickhandler={this.showValidate.bind(this)}
          tooltip='Validate'/>
        <SideIcons
          parentclass={this.state.searchhidden?'':'active-icon'}ß
          glyphicon='glyphicon-search'
          clickhandler={this.showSearch.bind(this)}
          tooltip='Search'/>
        <SideIcons parentclass='disclaimer'
          glyphicon='glyphicon-info-sign'
          clickhandler={this.showDisclaimer.bind(this)}
          tooltip='App Info'/>
      </div>
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
