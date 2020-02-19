class ValidatePanel extends React.Component{
  URLS ={
    PROJS: 'subscribe/getprojects',
    CLPROJ: 'subscribe/closeproject'
  }
  state = {
    projects : []
  }

  componentDidMount(){
    if (USER_STATE){
      fetch(this.URLS.PROJS).then(res => res.json())
      .then((res)=>{
        if (res.action == 'Success'){
          this.setState({
            projects:res.projects.sort().reverse()
          });
        }
      },(err)=>{
        l(err);
      });
    }
  }

  closeProject(e, pdate, pid){
    var template = 'Are you sure you want to close the project for %pdate? Closing the project means you will no longer be able to validate the points unless you set up another project.'
    var intent = confirm(template.replace('%pdate',pdate));
    var url = this.URLS.CLPROJ+"?pid="+pid
    if(intent){
      fetch(url).then(res => res.json())
        .then((res)=>{
          l(res);
        },(err)=>{
          l(err);
        })
    }
  }

  constructle(el,i){
    el = el.split("__");
    return <li key={i}>
      <a href={el[2]} target='_blank'> {el[1]}</a>
      &nbsp;&nbsp;&nbsp;<input type="submit" value="X" className="del-btn" title="delete" onClick={(e)=>this.closeProject(e, el[1], el[0])}/>
    </li>
  }
  render(){
    if (!USER_STATE){
      content = <div style={{'textAlign':'center','width':'100%'}}>
        <p> Login to validate the data </p>
        <button type="button" className="btn btn-warning map-upd-btn" onClick={()=>{location.href = 'accounts/login'}}>Login</button>
      </div>
    }else{
      if (this.state.projects.length == 0){
        var content = <div>
          Yo don't have any active projects at the moment.
        </div>
      }else{
        var lilist = [];
        for (var i=0;i<this.state.projects.length;i++){
            lilist.push(this.constructle(this.state.projects[i],i));
        }
        var content = <div>
          Click on the dates below to validate mined predictions for that day.
          <ul className="sub-list">
            {lilist}
          </ul>
        </div>
      }
    }
    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')} style={{'top':'100px'}}>
      <h1><b> Validation </b></h1>
      {content}
    </div>
  }
}
