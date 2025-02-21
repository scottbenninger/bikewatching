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

map.on('load', () => {
    console.log("Map has loaded");

    // Define a shared style object for consistency
    const bikeLaneStyle = {
        'line-color': '#228B22',  // Dark green
        'line-width': 2.5,        // Slightly thinner
        'line-opacity': 0.4       // More transparent
    };

    // Add Boston bike lanes source
    map.addSource('boston_route', {
        type: 'geojson',
        data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson?...'
    });

    // Add Cambridge bike lanes source
    map.addSource('cambridge_route', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson'
    });

    // Add Boston bike lanes layer
    map.addLayer({
        id: 'bike-lanes-boston',
        type: 'line',
        source: 'boston_route',
        paint: bikeLaneStyle
    });

    // Add Cambridge bike lanes layer
    map.addLayer({
        id: 'bike-lanes-cambridge',
        type: 'line',
        source: 'cambridge_route',
        paint: bikeLaneStyle
    });

    // --- STEP 3: Load Bluebikes Stations ---
    const jsonUrl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';

    d3.json(jsonUrl).then(jsonData => {
        console.log('Loaded JSON Data:', jsonData);

        // Extract station data
        const stations = jsonData.data.stations;
        console.log('Stations Array:', stations);

        // Create an SVG overlay
        const svg = d3.select("#map").append("svg")
            .attr("class", "stations-overlay");

        // Project longitude & latitude into map coordinates
        function projectPoint(lon, lat) {
            const point = map.project(new mapboxgl.LngLat(lon, lat));
            return [point.x, point.y];
        }

        // Add circle markers for each station
        svg.selectAll("circle")
            .data(stations)
            .enter()
            .append("circle")
            .attr("cx", d => projectPoint(d.Long, d.Lat)[0])
            .attr("cy", d => projectPoint(d.Long, d.Lat)[1])
            .attr("r", 4)  // Marker size
            .attr("fill", "#FF4500")  // Orange-Red color for visibility
            .attr("opacity", 0.75)
            .attr("stroke", "black")  // Adds a small border
            .attr("stroke-width", 0.5);

        console.log("Bike stations added to the map");

    }).catch(error => {
        console.error('Error loading JSON:', error);
    });
});
