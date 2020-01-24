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

  getOptions(list){
    var options = []
    for (let i = 0; i < list.length; i++) {
      options.push(<option value={list[i]} key={i}>{list[i]}</option>);
    }
    return options
  }

  render(){
    // var imageDates = this.props.imageDates;

    var singledate = <div className={this.props.showcomposite?'see-through ht_0':''}>
      <br/>Select a date of prediction
      <select className='select-image-date' id='selectimagedate'>
        {this.getOptions(this.props.imageDates)}
      </select>
      <br/><br/>
    </div>

    var range = <div className={this.props.showcomposite?'':'see-through ht_0'}>
      {/*Change sliders to control data*/}
      <br/>
      <div className='inputLabel'>Sliders to change time-series agreement(%) range</div>
      <div className='slider-div'><input type="text" id="probabilitySlider" /></div>
      <br/>
      <div className='inputLabel'>Sliders to change years </div>
      <div className='slider-div'><input type="text" id="yearSlider" /></div>
    </div>
    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')} style={{'top':'50px'}}>
      <input type="checkbox" className="form-check-input" id="showcomposite" onChange={this.props.oncheckchange} defaultChecked={this.props.showcomposite}/>
      <label className="form-check-label" htmlFor="showcomposite">&nbsp;SHOW COMPOSITE</label>
      {singledate}
      {range}
      <div style={{'textAlign':'center','width':'100%'}}>
        <button type="button" className="btn btn-warning map-upd-btn" onClick={this.props.slideradjusted}>Update Map</button>
      </div>
    </div>
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

class SearchPanel extends React.Component{
  render(){
    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')} style={{'top':'300px'}}>
      <PlaceHolder />
    </div>
  }
}
