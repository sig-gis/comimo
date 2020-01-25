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
    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')} style={{'top':'100px'}}>
      <PlaceHolder />
    </div>
  }
}

class DownloadPanel extends React.Component{
  render(){
    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')} style={{'top':'150px'}}>
      <PlaceHolder />
    </div>
  }
}

class SubscribePanel extends React.Component{
  render(){
    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')} style={{'top':'200px'}}>
      <h1><b> Your Subscriptions </b></h1><br/>
      <p> See and manage which regions you are getting alert from!</p><br/>
      <div style={{'textAlign':'center','width':'100%'}}>
        <button type="button" className="btn btn-warning map-upd-btn" onClick={()=>{location.href = './subscribe'}}>Manage Subscriptions</button>
      </div>
    </div>
  }
}

class ValidatePanel extends React.Component{
  render(){
    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')} style={{'top':'250px'}}>
      <PlaceHolder />
    </div>
  }
}
