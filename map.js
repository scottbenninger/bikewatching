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
    // Define a shared style object to avoid repetition
    const bikeLaneStyle = {
        'line-color': '#32D400',  // Bright green
        'line-width': 5,          // Thicker lines
        'line-opacity': 0.6       // Slight transparency
    };

    // Add Boston bike lanes source
    map.addSource('boston_route', {
        type: 'geojson',
        data: 'https://opendata.arcgis.com/datasets/7a7832f3c52449dfad6728d1ebfbb5b1_3.geojson'
    });

    // Add Cambridge bike lanes source
    map.addSource('cambridge_route', {
        type: 'geojson',
        data: 'https://data.cambridgema.gov/api/geospatial/gb5w-yva3?method=export&format=GeoJSON'
    });

    // Add Boston bike lanes layer
    map.addLayer({
        id: 'bike-lanes-boston',
        type: 'line',
        source: 'boston_route',
        paint: bikeLaneStyle  // Reusing the shared style object
    });

    // Add Cambridge bike lanes layer
    map.addLayer({
        id: 'bike-lanes-cambridge',
        type: 'line',
        source: 'cambridge_route',
        paint: bikeLaneStyle  // Using the same style for consistency
    });
});


