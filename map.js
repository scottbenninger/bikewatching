// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiYmVubmluZ2VyIiwiYSI6ImNtN2U0d3p0ZTBhdnQyaW9odnQzcmd5OTcifQ.ttcTw8RcxOKgNxDO6EJ39g';

// Initialize the map
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-71.092761, 42.357575], // Cambridge, MA
    zoom: 12,
    minZoom: 5,
    maxZoom: 18
});

// Select the existing SVG inside #map (from index.html)
const svg = d3.select("#map").select("svg");
let stations = [];  // Empty array for bike station data

// Function to convert latitude/longitude to pixel coordinates
function getCoords(station) {
    const point = new mapboxgl.LngLat(+station.Long, +station.Lat);
    const { x, y } = map.project(point);
    return { cx: x, cy: y };
}

// --- STEP 1: Load and Render Bike Lanes ---
map.on('load', () => {
    console.log("Map has loaded");

    // Define a shared style object for bike lanes
    const bikeLaneStyle = {
        'line-color': '#228B22',  // Dark green
        'line-width': 2.5,        // Slightly thinner
        'line-opacity': 0.4       // More transparent
    };

    // Add Boston bike lanes
    map.addSource('boston_route', {
        type: 'geojson',
        data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson?...'
    });

    map.addLayer({
        id: 'bike-lanes-boston',
        type: 'line',
        source: 'boston_route',
        paint: bikeLaneStyle
    });

    // Add Cambridge bike lanes
    map.addSource('cambridge_route', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson'
    });

    map.addLayer({
        id: 'bike-lanes-cambridge',
        type: 'line',
        source: 'cambridge_route',
        paint: bikeLaneStyle
    });

    // --- STEP 2: Load Bluebikes Stations ---
    const jsonUrl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';

    d3.json(jsonUrl).then(jsonData => {
        console.log('Loaded JSON Data:', jsonData);

        // Extract station data
        stations = jsonData.data.stations;
        console.log('Stations Array:', stations);

        // Append circles for each station
        const circles = svg.selectAll("circle")
            .data(stations)
            .enter()
            .append("circle")
            .attr("r", 5)               // Marker size
            .attr("fill", "steelblue")  // Circle color
            .attr("stroke", "white")    // Border color
            .attr("stroke-width", 1)    // Border thickness
            .attr("opacity", 0.8);      // Circle transparency

        console.log("Bike stations added!");

        // Initial positioning of markers
        updatePositions();

        // Reposition markers on map interactions
        map.on('move', updatePositions);
        map.on('zoom', updatePositions);
        map.on('resize', updatePositions);
        map.on('moveend', updatePositions);

        // Function to update circle positions dynamically
        function updatePositions() {
            circles
                .attr("cx", d => getCoords(d).cx) // Update x position
                .attr("cy", d => getCoords(d).cy); // Update y position
        }
    }).catch(error => {
        console.error('Error loading JSON:', error);
    });
});
