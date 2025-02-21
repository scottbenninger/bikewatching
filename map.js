// Set up empty arrays (though they are not used in Steps 1-3)
let departuresByMinute = Array.from({ length: 1440 }, () => []);
let arrivalsByMinute = Array.from({ length: 1440 }, () => []);

mapboxgl.accessToken = 'pk.eyJ1IjoiZGFsbGFzcGx1bmtldHQiLCJhIjoiY203Yzk1aXc2MDF5eTJ0b2tyb2hkeDY3ZiJ9.GUfDb4KmwC9Z7l1aLeJhgQ';

// Initialize the map
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-71.09415, 42.36027], // Centering on Cambridge, MA
    zoom: 12,
    minZoom: 5,
    maxZoom: 18
});

map.on('load', () => {
    console.log("Map has loaded");

    // Define a shared style for bike lanes
    const route_style = {
        'line-color': 'green',
        'line-width': 2,
        'line-opacity': 0.6
    };

    // Add Boston bike lanes
    map.addSource('boston_route', {
        type: 'geojson',
        data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson?...'
    });

    map.addLayer({
        id: 'bike-lanes-1',
        type: 'line',
        source: 'boston_route',
        paint: route_style
    });

    // Add Cambridge bike lanes
    map.addSource('cambridge_route', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson'
    });

    map.addLayer({
        id: 'bike-lanes-2',
        type: 'line',
        source: 'cambridge_route',
        paint: route_style
    });

    // --- STEP 3: Load Bluebikes Stations ---
    d3.json('https://dsc106.com/labs/lab07/data/bluebikes-stations.json').then(jsonData => {
        console.log('Loaded JSON Data:', jsonData);

        // Extract station data
        const stations = jsonData.data.stations;
        console.log('Stations Array:', stations);

        // Select or create an SVG layer inside the map container
        const svg = d3.select("#map").select("svg");
        if (svg.empty()) {
            d3.select("#map").append("svg")
                .attr("class", "stations-overlay")
                .style("position", "absolute")
                .style("top", "0")
                .style("left", "0")
                .style("width", "100%")
                .style("height", "100%")
                .style("pointer-events", "none")
                .style("z-index", "1");  // Ensure it's on top
        }

        // Function to convert lat/lon to pixel coordinates
        function projectPoint(lon, lat) {
            const point = map.project(new mapboxgl.LngLat(lon, lat));
            return { x: point.x, y: point.y };
        }

        // Append circles to the SVG for each station
        const circles = d3.select(".stations-overlay")
            .selectAll("circle")
            .data(stations)
            .enter()
            .append("circle")
            .attr("r", 5)  // Marker size
            .attr("fill", "orangered")  // Station marker color
            .attr("opacity", 0.75)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5);

        // Function to update circle positions dynamically
        function updatePositions() {
            circles
                .attr("cx", d => projectPoint(d.Long, d.Lat).x)
                .attr("cy", d => projectPoint(d.Long, d.Lat).y);
        }

        // Initial positioning
        updatePositions();

        // Update positions on map interactions
        map.on('move', updatePositions);
        map.on('zoom', updatePositions);
        map.on('resize', updatePositions);
        map.on('moveend', updatePositions);

        console.log("Bike stations added to the map");

    }).catch(error => {
        console.error('Error loading JSON:', error);
    });

});
