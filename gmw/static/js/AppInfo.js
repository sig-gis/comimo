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
    return <div className={['info-modal ',this.props.ishidden?'see-through':''].join(' ')} onClick={(e)=>{this.triggerFunction(e,this.props.onOuterClick)}}>
      <div className='inner-container'>
        <h3 className='heading3'> APP INFO </h3>
        <p>Here goes information about the applicaiton</p>
        <br/><b> DISCLAIMER </b>
        <p> Here goes disclaimer </p>
      </div>
    </div>
  }
}
