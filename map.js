// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiYmVubmluZ2VyIiwiYSI6ImNtN2U0d3p0ZTBhdnQyaW9odnQzcmd5OTcifQ.ttcTw8RcxOKgNxDO6EJ39g';

// Initialize the map
const map = new mapboxgl.Map({
    container: 'map', // ID of the div where the map will render
    style: 'mapbox://styles/mapbox/streets-v12', // Choose a different style if desired
    center: [-71.092761, 42.357575], // [longitude, latitude] for Cambridge, MA
    zoom: 12, // Initial zoom level
    minZoom: 5, // Minimum allowed zoom
    maxZoom: 18 // Maximum allowed zoom
});

map.on('load', () => {
    // Add a data source for Boston bike lanes
    map.addSource('boston_route', {
        type: 'geojson',
        data: 'https://opendata.arcgis.com/datasets/7a7832f3c52449dfad6728d1ebfbb5b1_3.geojson'
    });

    // Add a layer to display the bike lanes with custom styling
    map.addLayer({
        id: 'bike-lane-points',
        type: 'circle',  // Change from 'line' to 'circle'
        source: 'boston_route',
        paint: {
            'circle-radius': 4,          // Adjust the circle size
            'circle-color': '#32D400',   // Green color
            'circle-opacity': 0.7        // Slight transparency
        }
    });
    
});


