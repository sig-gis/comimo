class SubscribePanel extends React.Component{
  URLS ={
    SUBS:'subscribe/getsubs',
    DELSUBS: 'subscribe/delsubs',
    ADDSUBS: 'subscribe/addsubs'
  }
  state = {
    subsloaded:false
  }

  getSubs(){
    fetch(this.URLS.SUBS).then(res => res.json())
    .then((res)=>{
      if (res.action == 'Success'){
        this.setState({
          subsloaded:true
        });
        this.props.updateSubList(res.regions.sort());
      }
    },(err)=>{
      l(err);
    });
  }

  addSubs(e, region){
    if (region != ''){
      fetch(this.URLS.ADDSUBS+'?region='+region[1]+'&level='+region[0]).then(res => res.json())
      .then(
        (result) => {
          if (result.action == 'Created') {
            var currentList = this.props.list;
            currentList.push(result.level+"_"+result.region);
            currentList.sort();
            this.props.updateSubList(currentList);
          } else if (result.action == 'Exists'){
            alert('You are already subscribed to the region!');
          }
        },
        (error) => {
          l(error);
        }
      )
    }
  }

  delSubs(e, data){
    var arr = data.split('_');
    var level = arr.splice(0,1);
    var delconfirm = confirm('Are you sure you want to stop subscribing to '+arr.reverse().join(', ')+'? You will stop receiving alerts for this region.');
    if (delconfirm){
      fetch(this.URLS.DELSUBS+'?region='+arr.reverse().join('_')+'&level='+level).then(res => res.json())
      .then(
        (result) => {
          if (result.action != 'Error') {
            var currentList = this.props.list;
            currentList.splice(currentList.indexOf(result.level+'_'+result.region),1);
            this.props.updateSubList(currentList);
          }
        },
        (error) => {
          l(error);
        }
      )
    }
  }

  createList(list){
    var ul = [];
    for (let i = 0; i < list.length; i++) {
      var arr = list[i].split('_');
      ul.push(<tr key={i}>
        <td style={{width:'20px'}}>{i+1}</td>
        <td style={{width:'calc(100% - 50px)'}}>
        {arr[2]+', '}<i>{arr[1]}</i>
        </td><td style={{width:'30px'}}><input type="submit" value="X" data={list[i]} className="del-btn" title="delete" onClick={(e)=>this.delSubs(e, list[i])}/>
        </td>
      </tr>);
    }
    return <table style={{width:'100%',textAlign:'left'}}>

      <thead>
        <tr>
          <th style={{width:'20px'}}>SN</th>
          <th style={{width:'calc(100% - 50px)'}}>Municipality</th>
          <th style={{width:'30px'}}>Del</th>
        </tr>
      </thead>
      <tbody>{ul}</tbody>
    </table>
  }

  componentDidMount(){
    this.getSubs()
  }

  render(){
    var list = <div></div>
    if (this.props.list.length == 0){
      list = <div className="subs-header"><p>
      {this.state.subsloaded?"You don't seem to be subscribed to alerts from any region!":"Loading the regions that you are subscribed to" }
      </p></div>
    }
    else{
      list = <div>
        <div className="subs-header"> You are subscribed to alerts from following regions</div>
         {this.createList(this.props.list)}
        <br/>
      </div>
    }
    var subtocurrent = '';
    var selreg = this.props.selectedRegion;
    if (selreg && (this.props.list.indexOf(selreg[0]+'_'+selreg[1])==-1)){
      var reg = this.props.selectedRegion[1].split('_')
      subtocurrent = <div style={{'textAlign':'center','width':'100%'}}>
        <button type="button" className="btn btn-warning map-upd-btn" onClick={(e)=>{this.addSubs(e,this.props.selectedRegion)}}>
          Subscribe to {reg[1]}, <i>{reg[0]}</i>
        </button>
      </div>
    }
    var content = <div>
      {list}
      {/*// <div style={{'textAlign':'center','width':'100%'}}>
      //   <button type="button" className="btn btn-warning map-upd-btn" onClick={()=>{location.href = './subscribe'}}>Manage Subscriptions</button>
      // </div>*/}
      {subtocurrent}
    </div>
    if (!USER_STATE){
      content = <div style={{'textAlign':'center','width':'100%'}}>
        <p> Login to view your subscriptions </p>
        <button type="button" className="btn btn-warning map-upd-btn" onClick={()=>{location.href = 'accounts/login'}}>Login</button>
      </div>
    }
    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')} style={{'top':'50px','maxHeight':'500px'}}>
      <h1><b> YOUR SUBSCRIPTIONS </b></h1>
      {content}
    </div>
  }
}
