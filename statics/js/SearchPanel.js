class SearchPanel extends React.Component{
  render(){
    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')} style={{'top':'300px'}}>
      <PlaceHolder />
    </div>
  }
}
