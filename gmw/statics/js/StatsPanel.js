class StatsPanel extends React.Component{
  state = {
    names:[],
    series:[],
    c2_dates:[],
    c2_series:[],
    libloaded:false
  }
  URL = {
    ARSTATS : '/api/getareapredicted/',
    ARTS : '/api/getareats/',
  }
  fetchedFor=false;

  getAreaStats(date){
    var url = this.URL.ARSTATS+'?date='+date
    fetch(url).then(res => res.json())
      .then((res)=>{
        var data = [['Municipality','Area']]
        for (var i=0; i<res.names.length;i++){
          if (res.area[i]!=0) data.push([res.names[i],res.area[i]/1e6]);
        }
        if (res.names.length>0){
          var data = google.visualization.arrayToDataTable(data);

          // Optional; add a title and set the width and height of the chart
          var options = {'title':'For '+date, 'width':290, 'height':200, 'legend': { position: "none" }};

          // Display the chart inside the <div> element with id="piechart"
          var chart = new google.visualization.ColumnChart(document.getElementById('stats1'));
          chart.draw(data, options);
        }else{
          document.getElementById('stats1').innerHTML = '<i>No data found! Subscribe to more regions!</i>';
        }
      },(err)=>{
        console.log('Error loading stats!', e);
      });
  }
  getAreaTS(){
    var url = this.URL.ARTS
    fetch(url).then(res => res.json())
      .then((res)=>{
        var data = [['Municipality','Area']]
        var nonzero = false;
        for (var i=0; i<res.names.length;i++){
          data.push([res.names[i].substring(5),res.area[i]/1e6]);
          if (res.area[i]>0) nonzero = true;
        }
        if (nonzero){
          var data = google.visualization.arrayToDataTable(data);

          // Optional; add a title and set the width and height of the chart
          var options = {
            'title':'From '+res.names[0]+' to '+res.names[res.names.length-1],
            'width':290,
            'height':200,
            'legend': { position: "none" },
            'hAxis': { slantedText:true,}
          };

          // Display the chart inside the <div> element with id="piechart"
          var chart = new google.visualization.ColumnChart(document.getElementById('stats2'));
          chart.draw(data, options);
        }else {
          document.getElementById('stats2').innerHTML = '<i>No data found! Subscribe to more regions!</i>';
        }
      },(err)=>{
        console.log('Error loading stats!', e);
      });
  }

  componentDidUpdate(){
    if (USER_STATE && this.state.libloaded && this.fetchedFor != this.props.selectedDate){
      this.getAreaStats(this.props.selectedDate);
      this.getAreaTS();
      this.fetchedFor = this.props.selectedDate;
    }
  }

  componentDidMount(){
    google.charts.load('current',{'packages':['corechart']});
    google.charts.setOnLoadCallback(()=>{
      this.setState({
        libloaded:true
      });
    });
  }

  render(){
    if (!USER_STATE){
      var content = <div style={{'textAlign':'center','width':'100%'}}>
        <p> Login to view your subscriptions </p>
        <button type="button" className="btn btn-warning map-upd-btn" onClick={()=>{location.href = 'accounts/login'}}>Login</button>
      </div>
    }
    else{
      var content = <div>
        <b>Area per subscribed regions </b><br/>
        Note: Regions with no mines are not shown. Please subscribe to more regions to view area of mines predicted within.
        <div id="stats1">
        <b>Loading data...</b>
        </div>
        <b>Total area under subscribed regions </b>
        <div id="stats2">
        <b>Loading data...</b>
        </div>
      </div>
    }
    return <div className={['popup-container ',this.props.ishidden?'see-through':''].join(' ')} style={{'top':'250px','maxHeight':'calc( 100% - 250px )','overflowY':'auto'}}>
      {content}
    </div>
  }
}
