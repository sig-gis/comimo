

var table = new Tabulator("#datTable", {
	data:data,           //load row data from array
	layout:"fitColumns",      //fit columns to width of table
	responsiveLayout:"hide",  //hide columns that dont fit on the table
	tooltips:true,            //show tool tips on cells
	addRowPos:"top",          //when adding a new row, add it to the top of the table
	history:true,             //allow undo and redo actions on the table
	pagination:"local",       //paginate the data
	paginationSize:10,         //allow 7 rows per page of data
	movableColumns:true,      //allow column order to be changed
	resizableRows:true,       //allow row order to be changed
	columns:[                 //define the table columns
		{title:"user", field:"id", headerFilter:"input"},
    {title:"longitude", field:"y", headerFilter:"input"},
    {title:"latitude", field:"x", headerFilter:"input"},
    {title:"date", field:"dataDate", headerFilter:"number"},
    {title:"mine", field:"classNum", headerFilter:"number"},
		{title:"label", field:"className", headerFilter:"input"},
	],
});

//trigger download of data.csv file
$("#download-csv").click(function(){
    table.download("csv", "data.csv");
});

//trigger download of data.json file
$("#download-json").click(function(){
    table.download("json", "data.json");
});


console.log(data[0]);

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v9',
  center: [-73.5609339,4.6371205],
  zoom: 5
});

console.log(formatToGeoJson(data));
map.on('load', function() {
  map.addSource('data', {
    type: 'geojson',
    data:formatToGeoJson(data),
    cluster: true,
    clusterMaxZoom: 14, // Max zoom to cluster points on
    clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
  });
  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'data',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
      'circle-radius': ['step', ['get', 'point_count'], 20,100,30,750,40]
    }
  });
  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'data',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12
    }
  });
  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'data',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#11b4da',
      'circle-radius': 4,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff'
    }
  });

  // inspect a cluster on click
  map.on('click', 'clusters', function(e) {
    var features = map.queryRenderedFeatures(e.point, {
      layers: ['clusters']
    });
    var clusterId = features[0].properties.cluster_id;
    map.getSource('data').getClusterExpansionZoom(
      clusterId,
      function(err, zoom) {
        if (err) return;
        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom
        });
      }
    );
  });


  map.on('click', 'unclustered-point', function(e) {
    console.log(e.features);
    var count = e.features.length;
    var positive = 0;
    var users = [];
    for (var i=0; i<count; i++){
      if (e.features[i].properties.class == 1) positive += 1;
      if (users.indexOf(e.features[i].properties.user) == -1) users.push(e.features[i].properties.user);
    }
    var percent = positive/count*100+'%';
    var coordinates = e.features[0].geometry.coordinates.slice();
    console.log(percent)

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML("<table><tr><td>Collected by: </td><td>" + users.join(',') + "</td></tr><tr><td>% agreement:</td><td>" + percent + "</td></tr><tr><td>Total points:</td><td>" +count+"</td></tr></table>")
      .addTo(map);
  });

  map.on('mouseenter', 'clusters', function() {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'clusters', function() {
    map.getCanvas().style.cursor = '';
  });
});


function formatToGeoJson(data){
  var fc  = {
    "type": "FeatureCollection",
    "features": []
  };
  data.forEach((item, i) => {
    fc.features.push({
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [item.y, item.x]
      },
      "properties": {
        "user": item.id,
        "date": item.dataDate,
        "class": item.classNum,
        "label": item.className
      }
    })
  });
  return fc;
}
