
class SubscribedList extends React.Component{
  URLS = {
    getsubs : '/subscribe/getsubs',
    addsubs : '/subscribe/addsubs',
    delsubs : '/subscribe/delsubs',
  }
  constructor(props){
    super (props)
    this.state = {list:props.list}
  }

  // set up parameters after components are mounted
  componentDidMount(){
    console.log(this.props.list);
    this.getSubList();
  }

  createList(list){
    var ul = [];
    for (let i = 0; i < list.length; i++) {
      ul.push(<li key={i}>
        {list[i]}
        &nbsp;&nbsp;&nbsp;<input type="submit" value="X" data={list[i]} className="del-btn" title="delete" onClick={(e)=>this.delSubs(e, list[i])}/>
      </li>);
    }
    return ul;
  }

  getSubList(){
    fetch(this.URLS.getsubs).then(res => res.json())
    .then(
      (result) => {
        if (result.action != 'Error') this.setState({list:result['regions'].sort()})
      },
      (error) => {
        l(error);
      }
    )
  }

  delSubs(e, data){
    fetch(this.URLS.delsubs+'?region='+data).then(res => res.json())
    .then(
      (result) => {
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

  addSubs(e){
    var region = document.getElementById('regionBox').value
    if (region != ''){
      fetch(this.URLS.addsubs+'?region='+region).then(res => res.json())
      .then(
        (result) => {
          if (result.action == 'Created') {
            var currentList = this.state.list;
            currentList.push(result.region);
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

  render(){
    var list = <div></div>
    if (this.state.list.length == 0){
      list = <div className="subs-header"> You don't seem to be subscribed to alerts from any region! </div>
    }
    else{
      list = <div>
        <div className="subs-header"> You are subscribed to alerts from following regions</div>
        <ul> {this.createList(this.state.list)} </ul>
        <br/>
      </div>
    }
    var form = <form action='' className="form-horizontal">
      <label>Subscribe to a new region!</label>
      <input type="text" id="regionBox" name="region" className="form-control" placeholder="Enter Region Please" required></input>
      <input type='submit' value="Subscribe" className="btn btn-primary btn-sm" onClick={(e)=>{e.preventDefault();this.addSubs(e);}}></input>
    </form>

    return <div>
      {list}
      {form}
    </div>
  }
}
const props = {list:[]};
ReactDOM.render(<SubscribedList {...props}/>, document.getElementById('subs-list'));
