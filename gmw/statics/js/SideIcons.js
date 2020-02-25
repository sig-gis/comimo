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
