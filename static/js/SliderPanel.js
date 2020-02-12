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
      Select a date of prediction
      <select className='select-image-date' id='selectimagedate'>
        {this.getOptions(this.props.imageDates)}
      </select>
      <br/><br/>
    </div>

    var range = <div className={this.props.showcomposite?'':'see-through ht_0'}>
      {/*Change sliders to control data*/}
      <div className='inputLabel'>Sliders to change time-series agreement(%) range</div>
      <div className='slider-div'><input type="text" id="probabilitySlider" /></div>
      <br/>
      <div className='inputLabel'>Sliders to change years </div>
      <div className='slider-div'><input type="text" id="yearSlider" /></div>
    </div>
    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')} style={{'top':'300px'}}>
      <b>FILTER DATA</b><br/>
      <input type="checkbox" className="form-check-input" id="showcomposite" onChange={this.props.oncheckchange} defaultChecked={this.props.showcomposite}/>
      &nbsp;Show Composite <br/>
      <small className="form-text text-muted">time series agreement (%)</small>
      {singledate}
      {range}
      <div style={{'textAlign':'center','width':'100%'}}>
        <button type="button" className="btn btn-warning map-upd-btn" onClick={this.props.slideradjusted}>Update Map</button>
      </div>
    </div>
  }
}
