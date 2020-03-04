class AppInfo extends React.Component{
  constructor(props){
    super(props);
  }

  triggerFunction(e, handler){
    if(e.target == e.currentTarget){
      handler();
    }
  }

  render(){
    if (USER_ADM){
      var adm_links = <span>
        <a href='/download'>Download Validated data </a> |
      </span>
    }
    if (USER_STATE){
      var user_section = <div className="user-section" style={{float:'right'}}>
        {adm_links} 
        <span>
          <a href='/accounts/logout'>Log out</a>
        </span>
      </div>
    }

    return <div className={['info-modal ',this.props.ishidden?'see-through':''].join(' ')} onClick={(e)=>{this.triggerFunction(e,this.props.onOuterClick)}}>
      <div className='inner-container'>
        {user_section}
        <h3 className='heading3'> APP INFO </h3>
        <p>Here goes information about the applicaiton</p>
        <br/><b> DISCLAIMER </b>
        <p> Here goes disclaimer </p>
      </div>
    </div>
  }
}
