class DownloadPanel extends React.Component{
  state = {
      generatingLink:false,
      clipOption:false
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
    fetch(url).then(res => res.json())
      .then((res) => {
        l(res)
      }, (err) => {
        l(err)
      });
  }

  render(){
    var button ='';
    if(this.state.clipOption && this.props.selectedDate){
      button = <div style={{'textAlign':'center','width':'100%'}}>
        <button type="button" className="btn btn-warning map-upd-btn" onClick={this.getDownloadUrl.bind(this)}>
          Get download URL for {this.props.selectedDate}
        </button>
      </div>
    }

    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')} style={{'top':'350px'}}>
      <h1><b> DOWNLOAD DATA </b></h1>
      <b>Select Region</b><br/>
      <input type='radio' name='downloadRegion' value={1} onChange={this.radioChange.bind(this)}/> Complete Data <br/>
      <input type='radio' name='downloadRegion' value={2} onChange={this.radioChange.bind(this)} disabled={!this.props.regionSelected}/> Selected Municipality <br/>
      {button}
    </div>
  }
}
