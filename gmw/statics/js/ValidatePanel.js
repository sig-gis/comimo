class ValidatePanel extends React.Component{
  URLS ={
    PROJS: 'subscribe/getprojects',
    CLPROJ: 'subscribe/closeproject',
    CRTPROJ: 'subscribe/createproject'
  }
  state = {
    projects : [],
    delete : [],
    createstate: true,
    errormsg : false,
    region: 1,
  }

  componentDidMount(){
    if (USER_STATE){
      fetch(this.URLS.PROJS).then(res => res.json())
      .then((res)=>{
        if (res.action == 'Success'){
          this.setState({
            projects:res.projects
          });
        }
      },(err)=>{
        l(err);
      });
    }
  }

  createProject(e,pdate){
    this.setState({createstate:false,errormsg:false});
    if (this.state.region == 1){
      var selectedarr = this.props.sublist;
      var regionerror = "Subscribed regions are loading or you are not subscribed to any region!";
    }else if (this.state.region == 2) {
      var selectedarr = [...document.getElementById('selectProjRegions').options].filter(x => x.selected).map(x => 'mun_'+x.value);
      var regionerror = "No region selected!";
    }
    var name = document.getElementById('projectName').value;

    var errortext = '';
    if (!name) errortext += "Please enter a project name!\n"
    else if (this.state.projects.map(x => x[4]).includes(name)) errortext += "A project with that name already exists! Please choose a different name!\n"
    else if(!selectedarr.length) errortext += regionerror

    if (errortext){
      this.setState({
        createstate:true,
        errormsg:errortext
      });
    }else {
      var disp = selectedarr.map((e)=>{
        var es = e.split('_');
        return es[2]+', '+es[1]
      }).join(';');
      var question = "Proceed with the configuration => prediction date = {%date}, project name = {%name} and regions = {%region}?"
                  .replace('{%date}',pdate)
                  .replace('{%name}',name)
                  .replace('{%region}',disp)
      var proceed = confirm(question)
      if(proceed){
        var url = this.URLS.CRTPROJ+"?pdate="+pdate+"&name="+name+"&regions="+selectedarr.join('__');
        if (USER_STATE){
          fetch(url).then(res => res.json())
          .then((res)=>{
            if (res.action != 'Error'){
              var projects = this.state.projects;
              projects.push(res.proj);
              this.setState({
                createstate:true,
                projects:projects
              });
            }else{
              this.setState({createstate:true,errormsg:res.message});
            }
          },(err)=>{
            l(err);
            this.setState({createstate:true,errormsg:'Something went wrong!'});
          });
        }
      }else this.setState({createstate:true});
    }
  }

  closeProject(e, pdate, pid, i){
    // e.target.disabled = true;
    this.setState({
      delete: this.state.delete.concat([pid])
    })
    var template = 'Are you sure you want to close the project for %pdate? Closing the project means you will no longer be able to validate the points unless you set up another project.'
    var intent = confirm(template.replace('%pdate',pdate));
    var url = this.URLS.CLPROJ+"?pid="+pid+"&pdate="+pdate;
    if(intent){
      var p = this.state.projects[i];
      fetch(url).then(res => res.json())
        .then((res)=>{
          if(res.action=='Archived'){
            var projects = this.state.projects;
            var j = projects.indexOf(p);
            projects.splice(j,1);
            var itemIndex = this.state.delete.indexOf(pid);
            var del = this.state.delete;
            if (itemIndex>-1){
              del.splice(itemIndex,1)
            }
            this.setState({
              projects: projects,
              delete: del
            });
          }else{
            l('Could not delete project.');
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
    // el = el.split("__");
    var r = el[5].split('__').map(x => x.split('_')).map(x => x[2]+', '+x[1]).join(';');
    return <tr key={i}>
      <td style={{width:'20px'}}>{i+1}</td>
      <td style={{width:'calc(100% - 50px)'}}><a href={el[3]} target='_blank'> {el[4]}</a>
        <br/><small>Prediction date:{el[0]}</small>
        <br/><small>Created date:{el[1]}</small>
        <br/><small>Regions:{r}</small>
      </td>
      <td style={{width:'30px'}}><input type="submit" value="X" className="del-btn" disabled={this.state.delete.includes(el[2])} title={"Delete "+el[4]} onClick={(e)=>this.closeProject(e, el[0], el[2], i)}/></td>
    </tr>

  }

  handleSelectClick(e){
    e.preventDefault();
    e.target.selected = !e.target.selected;
  }

  generateMunicipalOptions(){
    var options = [];
    var f = this.props.featureNames;
    var states = Object.keys(f).sort();
    if (states.length <= 0){
      options.push(<option key='0' disabled>Loading ...</option>)
    }else {
      for (var s=0;s<states.length;s++){
        var state = states[s];
        var muns = Object.keys(f[state]).sort();
        var munopts = [];
        for (var m=0;m<muns.length;m++){
          var mun = muns[m];
          munopts.push(<option key={'m'+m} onMouseDown={this.handleSelectClick} value={state+'_'+mun}>{mun}</option>)
        }
        options.push(<optgroup key={'s'+s} label={state}>{munopts}</optgroup>)
      }
    }
    return <select multiple id="selectProjRegions" size='8' style={{width:'100%',float:'left',marginBottom:'10px'}}>
      {options}
    </select>
  }

  regionRadioChanged(e){
    this.setState({
      region:e.target.value
    })
  }

  render(){
    if (!USER_STATE){
      var content = <div style={{'textAlign':'center','width':'100%'}}>
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
        var context = <div>
          You don't have any active projects at the moment.
        </div>
      }else{
        var lilist = [];
        for (var i=0;i<this.state.projects.length;i++){
            lilist.push(this.constructle(this.state.projects[i],i));
        }
        var context = <div>
          Click on the dates below to validate mined predictions for that day.
          <ul className="sub-list">
            {lilist}
          </ul>
        </div>
        var context = <table style={{width:'100%',textAlign:'left'}}>
          <thead>
            <tr>
              <th style={{width:'20px'}}>SN</th>
              <th style={{width:'calc(100% - 50px)'}}>Name</th>
              <th style={{width:'30px'}}>Del</th>
            </tr>
          </thead>
          <tbody>{lilist}</tbody>
        </table>
      }

      var addOptions = '';
      if (this.state.region == 2) addOptions = this.generateMunicipalOptions();

      var content = <div>
        {context}
        <br/><h2><b>Create a new project:</b></h2>
        Enter Project Name:<br/>
        <input id='projectName' length="2" style={{width:'100%'}}/><br/>
        Select Project Region:<br/>
        <input type='radio' name='projectRegion' value={1} onChange={this.regionRadioChanged.bind(this)} defaultChecked/> Subscribed Regions <br/>
        <input type='radio' name='projectRegion' value={2} onChange={this.regionRadioChanged.bind(this)}/> Custom Regions <br/>
        {addOptions}
        {button}
        {this.state.errormsg}
      </div>
    }

    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')} style={{'top':'100px',maxHeight:'calc(100% - 100px)',overflowY:'auto'}}>
      <h1><b> VALIDATION </b></h1>
      {content}
    </div>
  }
}
