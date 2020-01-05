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

class SliderPanel extends React.Component{
  componentDidMount(){
    this.probSlider = new rSlider({
        target: '#probabilitySlider',
        values: {min:0, max:100},
        step:1,
        range: true,
        scale: false,
        labels:false,
        set: [50, 100]
    });
    this.yearSlider = new rSlider({
        target: '#yearSlider',
        values: {min:2000, max:2019},
        step:1,
        range: true,
        scale: false,
        labels:false,
        set: [2000, 2019]
    });
  }
  render(){
    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')}>
      <h1><b>Change sliders to control data</b></h1>
      <br/>
      <div className='inputLabel'>Sliders to change probability %</div>
      <div className='slider-div'><input type="text" id="probabilitySlider" /></div>
      <br/>
      <div className='inputLabel'>Sliders to change years </div>
      <div className='slider-div'><input type="text" id="yearSlider" /></div>
      <div style={{'textAlign':'center','width':'100%'}}>
        <button type="button" className="btn btn-warning map-upd-btn">Update Map</button>
      </div>
    </div>
  }
}

class StatsPanel extends React.Component{
  render(){
    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')}>
      <PlaceHolder />
    </div>
  }
}

class DownloadPanel extends React.Component{
  render(){
    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')}>
      <PlaceHolder />
    </div>
  }
}

class SubscribePanel extends React.Component{
  render(){
    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')}>
      <PlaceHolder />
    </div>
  }
}

class ValidatePanel extends React.Component{
  render(){
    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')}>
      <PlaceHolder />
    </div>
  }
}

class SearchPanel extends React.Component{
  render(){
    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')}>
      <PlaceHolder />
    </div>
  }
}
