class ValidatePanel extends React.Component{
  URLS ={
    PROJS: 'subscribe/getprojects',
    CLPROJ: 'subscribe/closeproject',
    CRTPROJ: 'subscribe/createproject'
  }
  state = {
    projects : [],
    createstate: true,
    errormsg : false
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

  createProject(e,pdate){
    this.setState({createstate:false,errormsg:false});
    e.target.disabled = true;
    var url = this.URLS.CRTPROJ+"?pdate="+pdate;
    if (USER_STATE){
      fetch(url).then(res => res.json())
      .then((res)=>{
        if (res.action != 'Error'){
          var projects = this.state.projects;
          projects.push(res.proj);
          this.setState({
            createstate:true,
            projects:projects.sort().reverse()
          });
        }else{
          this.setState({createstate:true,errormsg:res.message});
        }
      },(err)=>{
        l(err);
        this.setState({createstate:true});
      });
    }
  }

  closeProject(e, pdate, pid, i){
    e.target.disabled = true;
    var template = 'Are you sure you want to close the project for %pdate? Closing the project means you will no longer be able to validate the points unless you set up another project.'
    var intent = confirm(template.replace('%pdate',pdate));
    var url = this.URLS.CLPROJ+"?pid="+pid+"&pdate="+pdate;
    if(intent){
      fetch(url).then(res => res.json())
        .then((res)=>{
          if(res.action=='Archived'){
            var projects = this.state.projects;
            projects.splice(i,1);
            this.setState({
              projects: projects
            });
          }
          else{
            l('could not delete project.');
          }
        },(err)=>{
          e.target.disabled = false;
          l(err);
        })
    }else{
      e.target.disabled = false;
    }
  }

  constructle(el,i){
    el = el.split("__");
    return <li key={i}>
      <a href={el[2]} target='_blank'> {el[0]}</a>
      &nbsp;&nbsp;&nbsp;<input type="submit" value="X" className="del-btn" title="delete" onClick={(e)=>this.closeProject(e, el[0], el[1], i)}/>
    </li>
  }

  render(){
    if (!USER_STATE){
      content = <div style={{'textAlign':'center','width':'100%'}}>
        <p> Login to validate the data </p>
        <button type="button" className="btn btn-warning map-upd-btn" onClick={()=>{location.href = 'accounts/login'}}>Login</button>
      </div>
    }else{
      var selDate = this.props.selectedDate;
      if (selDate){
        var match = this.state.projects.filter(x => x.includes(selDate+'__'));
        if (match.length == 0){
          var button = <div style={{'textAlign':'center','width':'100%'}}>
          <br/>
            <button type="button" className="btn btn-warning map-upd-btn" onClick={(e)=>{this.createProject(e,selDate);}} disabled={!this.state.createstate}>
              Create new project for {selDate}</button>
          </div>
        }
      }
      if (this.state.projects.length == 0){
        var content = <div>
          You don't have any active projects at the moment.
          {button}
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
          {button}
        </div>
      }
    }
    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')} style={{'top':'100px'}}>
      <h1><b> Validation </b></h1>
      {content}
      {this.state.errormsg}
    </div>
  }
}
