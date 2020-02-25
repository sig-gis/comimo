class DownloadPanel extends React.Component{
  state = {
      generatingLink:false,
      clipOption:false,
      downURL:false,
      fetching:false
  }
  URL = {
    GETDL : '/api/getdownloadurl'
  }

  radioChange(e){
    this.setState({
      clipOption:document.querySelector('input[name=downloadRegion]:checked').value
    });
  }

  getDownloadUrl(e){
    if (this.state.clipOption == '1'){
      var region = 'all';
      var date = this.props.selectedDate;
    }else if (this.state.clipOption == '2'){
      var region = this.props.regionSelected[1];
      var level = this.props.regionSelected[0];
      var date = this.props.selectedDate;
    }
    var url = this.URL.GETDL+"?region="+region+"&level="+level+"&date="+date;
    this.setState({fetching:true})
    fetch(url).then(res => res.json())
      .then((res) => {
        if(res.action == 'success'){
          this.setState({
            downURL:[region, level, date, res.url],
            fetching:false
          })
        }
      }, (err) => {
        l(err)
      });
  }

  render(){
    var button='', link='';
    if(this.state.clipOption && this.props.selectedDate){
      button = <div style={{'textAlign':'center','width':'100%'}}>
        <button type="button" className="btn btn-warning map-upd-btn" onClick={this.getDownloadUrl.bind(this)} disabled={this.state.fetching}>
          Get download URL for {this.props.selectedDate}
        </button>
      </div>
    }
    if (this.state.fetching){
      link = <p> Fetching download URL ... </p>
    }else if(this.state.downURL){
      link = <p>
        <span><a href={this.state.downURL[3]}>Click here to download the {this.state.downURL[0]=='all'?'complete data':'data within '+this.state.downURL[0]} for {this.state.downURL[2]}.</a></span>
      </p>
    }

    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')} style={{'top':'350px'}}>
      <h1><b> DOWNLOAD DATA </b></h1>
      <b>Select Region</b><br/>
      <input type='radio' name='downloadRegion' value={1} onChange={this.radioChange.bind(this)}/> Complete Data <br/>
      <input type='radio' name='downloadRegion' value={2} onChange={this.radioChange.bind(this)} disabled={!this.props.regionSelected}/> Selected Municipality <br/>
      {button}
      {link}
    </div>
  }
}
