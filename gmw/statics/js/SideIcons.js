class SideIcons extends React.Component{
  render(){
    var parentProps = {
      className:'sidebar-icon '+this.props.parentclass,
      onClick: this.props.clickhandler,
      title: this.props.tooltip
    }
    return <button {...parentProps}>
      <span className={'glyphicon '+this.props.glyphicon}></span>
    </button>
  }
}

class PlaceHolder extends React.Component{
  render(){
    return <div className="placeholder"><b> Work in Progress ... </b></div>
  }
}

class StatsPanel extends React.Component{
  render(){
    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')} style={{'top':'250px'}}>
      <PlaceHolder />
    </div>
  }
}

class DownloadPanel extends React.Component{
  render(){
    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')} style={{'top':'350px'}}>
      <h1><b> DOWNLOAD DATA </b></h1>
      <b>Select Region</b><br/>
      <input type='radio' name='downloadRegion' value={0}/> Complete Data <br/>
      <input type='radio' name='downloadRegion' value={1} disabled={!this.props.regionSelected}/> Selected Municipality <br/>
    </div>
  }
}

class ValidatePanel extends React.Component{
  render(){
    var content = <div>
      In order to validate the project, go to the following
      &nbsp;<a href="https://collect.earth/collection?projectId=5439">CEO project </a>.
    </div>
    if (!USER_STATE){
      content = <div style={{'textAlign':'center','width':'100%'}}>
        <p> Login to validate the data </p>
        <button type="button" className="btn btn-warning map-upd-btn" onClick={()=>{location.href = 'accounts/login'}}>Login</button>
      </div>
    }
    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')} style={{'top':'100px'}}>
      <h1><b> Validation </b></h1>
      {content}
    </div>
  }
}
