mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

class GoldMap extends React.Component{
  map;

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [-73.5609339,4.6371205],
      zoom: 5
    });

    this.map.on('load', (e) => {
      // Add zoom and rotation controls to the map.
      this.map.addControl(new mapboxgl.NavigationControl({showCompass:false}));
      // this.map.addSource('countries', {
      //   type: 'geojson',
      //   data
      // });
      //
      // this.map.addLayer({
      //   id: 'countries',
      //   type: 'fill',
      //   source: 'countries'
      // }, 'country-label-lg'); // ID metches `mapbox/streets-v9`

      // this.setFill();
    });
  }

  render(){
    return(<div ref={el => this.mapContainer = el}></div>);
  }
}
