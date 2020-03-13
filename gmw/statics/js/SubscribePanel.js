class SubscribePanel extends React.Component{
  URLS ={
    SUBS:'subscribe/getsubs',
    DELSUBS: 'subscribe/delsubs',
    ADDSUBS: 'subscribe/addsubs'
  }
  state = {
    list:[],
    subsloaded:false
  }

  getSubs(){
    fetch(this.URLS.SUBS).then(res => res.json())
    .then((res)=>{
      if (res.action == 'Success'){
        this.setState({
          list:res.regions.sort(),
          subsloaded:true
        });
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
            var currentList = this.state.list;
            currentList.push(result.level+"_"+result.region);
            currentList.sort();
            this.setState({
              list: currentList
            });
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
    fetch(this.URLS.DELSUBS+'?region='+arr[1]+'&level='+arr[0]).then(res => res.json())
    .then(
      (result) => {
        l(result)
        if (result.action != 'Error') {
          var currentList = this.state.list;
          currentList.splice(currentList.indexOf(result.region),1)
          this.setState({
            list: currentList
          });
        }
      },
      (error) => {
        l(error);
      }
    )
  }

  createList(list){
    var ul = [];
    for (let i = 0; i < list.length; i++) {
      var arr = list[i].split('_');
      ul.push(<li key={i}>
        {arr[1]}
        &nbsp;&nbsp;&nbsp;<input type="submit" value="X" data={list[i]} className="del-btn" title="delete" onClick={(e)=>this.delSubs(e, list[i])}/>
      </li>);
    }
    return ul;
  }

  componentDidMount(){
    this.getSubs()
  }

  render(){
    var list = <div></div>
    if (this.state.list.length == 0){
      list = <div className="subs-header"><p>
      {this.state.subsloaded?"You don't seem to be subscribed to alerts from any region!":"Loading the regions that you are subscribed to" }
      </p></div>
    }
    else{
      list = <div>
        <div className="subs-header"> You are subscribed to alerts from following regions</div>
        <ul className="sub-list"> {this.createList(this.state.list)} </ul>
        <br/>
      </div>
    }
    var subtocurrent = '';
    var selreg = this.props.selectedRegion;
    if (selreg && (this.state.list.indexOf(selreg[0]+'_'+selreg[1])==-1)){
      subtocurrent = <div style={{'textAlign':'center','width':'100%'}}>
        <button type="button" className="btn btn-warning map-upd-btn" onClick={(e)=>{this.addSubs(e,this.props.selectedRegion)}}>
          Subscribe to {this.props.selectedRegion[1]}
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
