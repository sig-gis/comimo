class SelectRegion extends React.Component{
  state = {
    l1names : [],
    l2names : {},
    l1name : false
  }

  getMunNames(){
    fetch('/api/getcascadingnames').then(res => res.json()).then(
      (res) => {
        this.setState({
          l1names:Object.keys(res),
          l2names:res
        });
      }, (err) => {
        l(err)
      }
    )
  }

  updateL1Selection(e){
    this.setState({
      l1name:e.target.value
    });
  }

  componentDidMount(){
    this.getMunNames()
  }

  render(){
    var l1 = [];
    if (this.state.l1names.length == 0) l1.push(<option key={0}>Loading ... </option>)
    else l1.push(<option key={0} value={false} disabled>Select a state</option>)
    this.state.l1names.forEach((item, i) => {
      l1.push(<option key={i+1} value={item}>{item}</option>)
    });
    var sell2 = '';
    if (this.state.l1name){
      var l2 = [];
      l2.push(<option key={0} value={false} disabled>Select a Municipality</option>)
      this.state.l2names[this.state.l1name].forEach((item, i) => {
        l2.push(<option key={i+1} value={item}>{item}</option>)
      });
      sell2 = <select className='select-l2 w_100' id='selectl2'>
        {l2}
      </select>
    }
    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')} style={{'top':'0px'}}>
      <b>SELECT REGION OF INTEREST</b><br/>
      <input type="radio" value="mun"/> <b>Municipality</b><br/>
      Colombia <br/>
      <select className='select-l1 w_100' id='selectl1' onChange={this.updateL1Selection.bind(this)}>
        {l1}
      </select><br/>
      {sell2}<br/><br/>
      <div style={{'textAlign':'center','width':'100%'}}>
        <button type="button" className="btn btn-warning map-upd-btn" onClick={this.props.regionSelected}>Select Region</button>
      </div>
    </div>
  }
}
