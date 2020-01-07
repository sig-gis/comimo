mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

class GoldMap extends React.Component{

  constructor(props){
    super(props);
    this.map;
    this.oldprops = this.props;
  }

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

  refreshLayers(){
    l('refreshLayers');
  }


  componentDidUpdate(){
    l("gold.js");
    l("if parameters changed, ");
    this.refreshLayers();
    // fetch("https://127.0.0.1:8000/api/test")
    //   .then(res => res.json())
    //   .then(
    //     (result) => {
    //       // this.setState({
    //       //   isLoaded: true,
    //       //   items: result.items
    //       // });
    //       console.log(result);
    //     },
    //     // Note: it's important to handle errors here
    //     // instead of a catch() block so that we don't swallow
    //     // exceptions from actual bugs in components.
    //     (error) => {
    //       this.setState({
    //         isLoaded: true,
    //         error
    //       });
    //     }
    //   )
  }

  render(){
    return(<div ref={el => this.mapContainer = el}></div>);
  }
}
