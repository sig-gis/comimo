class SubscribePanel extends React.Component{

  componentDidMount(){
    l('subs panel mounted')
  }

  render(){
    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')} style={{'top':'50px'}}>
      <h1><b> YOUR SUBSCRIPTIONS </b></h1>
      <p> See and manage which regions you are getting alert from!</p><br/>
      <div style={{'textAlign':'center','width':'100%'}}>
        <button type="button" className="btn btn-warning map-upd-btn" onClick={()=>{location.href = './subscribe'}}>Manage Subscriptions</button>
      </div>
    </div>
  }
}
