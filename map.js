let departuresByMinute = Array.from({ length: 1440 }, () => []);
let arrivalsByMinute = Array.from({ length: 1440 }, () => []);

mapboxgl.accessToken =
    'pk.eyJ1IjoiYmVubmluZ2VyIiwiYSI6ImNtN2U0d3p0ZTBhdnQyaW9odnQzcmd5OTcifQ.ttcTw8RcxOKgNxDO6EJ39g';

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',  // Use a full-color map style
        center: [-71.09415, 42.36027],
        zoom: 12,
        minZoom: 5,
        maxZoom: 18
    });
    
function minutesSinceMidnight(date) {
    return date.getHours() * 60 + date.getMinutes();
}

map.on('load', () => {
    const route_style = {
        'line-color': 'green',
        'line-width': 2,
        'line-opacity': 0.3
    };

    map.addSource('boston_route', {
        type: 'geojson',
        data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson?...'
    });

    map.addSource('cambridge_route', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson'
    });

    map.addLayer({
        id: 'bike-lanes-1',
        type: 'line',
        source: 'boston_route',
        paint: route_style
    });

    map.addLayer({
        id: 'bike-lanes-2',
        type: 'line',
        source: 'cambridge_route',
        paint: route_style
    });

    const svg = d3.select('#map').select('svg');

    let stations = [],
        circles,
        trips = [],
        departures,
        arrivals;

    let timeFilter = -1;
    const timeSlider = document.getElementById('time-slider'),
          selectedTime = document.getElementById('selected-time'),
          anyTimeLabel = document.getElementById('any-time');

    timeSlider.addEventListener('input', updateTimeDisplay);
    updateTimeDisplay();

    d3.json('https://dsc106.com/labs/lab07/data/bluebikes-stations.json')
        .then(jsonData => {
            stations = jsonData.data.stations;

            d3.csv('https://dsc106.com/labs/lab07/data/bluebikes-traffic-2024-03.csv')
                .then(csvData => {
                    trips = csvData;

                    for (let trip of trips) {
                        trip.started_at = new Date(trip.started_at);
                        trip.ended_at = new Date(trip.ended_at);

                        let startedMinutes = minutesSinceMidnight(trip.started_at);
                        departuresByMinute[startedMinutes].push(trip);

                        let endedMinutes = minutesSinceMidnight(trip.ended_at);
                        arrivalsByMinute[endedMinutes].push(trip);
                    }

                    departures = d3.rollup(
                        trips,
                        v => v.length,
                        d => d.start_station_id
                    );

                    arrivals = d3.rollup(
                        trips,
                        v => v.length,
                        d => d.end_station_id
                    );

                    stations = stations.map(station => {
                        let id = station.short_name;
                        station.arrivals = arrivals.get(id) ?? 0;
                        station.departures = departures.get(id) ?? 0;
                        station.totalTraffic = station.arrivals + station.departures;
                        return station;
                    });

                    updateCircles(stations);
                })
                .catch(error => console.error('Error loading CSV:', error));
        })
        .catch(error => console.error('Error loading JSON:', error));

    map.on('move', updatePositions);
    map.on('zoom', updatePositions);
    map.on('resize', updatePositions);
    map.on('moveend', updatePositions);


    function getCoords(station) {
        const point = new mapboxgl.LngLat(+station.lon, +station.lat);
        const { x, y } = map.project(point);
        return { cx: x, cy: y };
    }


    function updatePositions() {
        circles
            .attr('cx', d => getCoords(d).cx)
            .attr('cy', d => getCoords(d).cy);
    }


    function formatTime(minutes) {
        const date = new Date(0, 0, 0, 0, minutes);
        return date.toLocaleString('en-US', { timeStyle: 'short' });
    }


    function filterTripsByTime(timeVal) {
        if (timeVal === -1) {
            return {
                filteredArrivals: arrivals,
                filteredDepartures: departures,
                filteredStations: stations
            };
        }


        const filteredDepartures = d3.rollup(
            filterByMinute(departuresByMinute, timeFilter),
            v => v.length,
            d => d.start_station_id
        );


        const filteredArrivals = d3.rollup(
            filterByMinute(arrivalsByMinute, timeFilter),
            v => v.length,
            d => d.end_station_id
        );


        const filteredStations = stations.map(station => {
            let newStation = { ...station };
            let id = newStation.short_name;

            newStation.arrivals = filteredArrivals.get(id) ?? 0;
            newStation.departures = filteredDepartures.get(id) ?? 0;
            newStation.totalTraffic = newStation.arrivals + newStation.departures;
            return newStation;
        });

        return {
            filteredArrivals,
            filteredDepartures,
            filteredStations
        };
    }


    function filterByMinute(tripsByMinute, minute) {
        let minMinute = (minute - 60 + 1440) % 1440,
            maxMinute = (minute + 60) % 1440;

        if (minMinute > maxMinute) {
            let beforeMidnight = tripsByMinute.slice(minMinute),
                afterMidnight = tripsByMinute.slice(0, maxMinute);
            return beforeMidnight.concat(afterMidnight).flat();
        } else {
            return tripsByMinute.slice(minMinute, maxMinute).flat();
        }
    }


    function updateCircles(stationData) {
        let stationFlow = d3
            .scaleQuantize()
            .domain([0, 1])
            .range([0, 0.5, 1]);
        const radiusScale = d3.scaleSqrt()
            .domain([0, d3.max(stationData, d => d.totalTraffic)])
            .range([0, 20]);
        circles = svg
            .selectAll('circle')
            .data(stationData, d => d.short_name)
            .join('circle')
            .attr('fill', 'orangered')
            .attr('stroke', 'white')
            .attr('stroke-width', 1)
            .attr('opacity', 0.7)
            .attr('r', d => radiusScale(d.totalTraffic))
            .style("--departure-ratio", d => (d.totalTraffic === 0) ? 0.5 : stationFlow(d.departures / d.totalTraffic));

        circles.selectAll('title').remove();
        circles.append('title')
            .text(d =>
                `${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`
            );

        updatePositions();
    }

    function updateTimeDisplay() {
        timeFilter = Number(timeSlider.value);

        if (timeFilter === -1) {
            selectedTime.textContent = '';
            anyTimeLabel.style.display = 'block';
        } else {
            selectedTime.textContent = formatTime(timeFilter);
            anyTimeLabel.style.display = 'none';
        }

        const { filteredArrivals, filteredDepartures, filteredStations } = filterTripsByTime(timeFilter);
        updateCircles(filteredStations);
    }
});
