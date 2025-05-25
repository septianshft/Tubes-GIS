// Initialize the map and set its view to Telkom University coordinates
const map = L.map('map').setView([-6.972775814889462, 107.63050136194732], 15);

// Add a tile layer to the map (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <b>Laundry Locator</b>'
}).addTo(map);

// Hero section functionality
const heroSection = document.getElementById('hero-section');
const appContainer = document.getElementById('app-container');
const getStartedBtn = document.getElementById('get-started-btn');
const backToHeroBtn = document.getElementById('back-to-hero');

// Function to handle transition from hero to app
function showApp() {
    heroSection.classList.remove('active');
    heroSection.classList.add('hidden');
    appContainer.style.display = 'flex';
    
    // Give time for the hero section to animate out
    setTimeout(() => {
        heroSection.style.display = 'none';
        // Invalidate map size to ensure it renders correctly
        map.invalidateSize();
    }, 800);
}

// Function to go back to hero
function showHero() {
    heroSection.style.display = 'flex';
    // Give time for the DOM to update
    setTimeout(() => {
        heroSection.classList.remove('hidden');
        heroSection.classList.add('active');
        appContainer.style.display = 'none';
    }, 10);
}

// Event listeners for hero buttons
getStartedBtn.addEventListener('click', showApp);
backToHeroBtn.addEventListener('click', showHero);

// Also allow scrolling to start the app
window.addEventListener('wheel', (e) => {
    if (heroSection.classList.contains('active') && e.deltaY > 0) {
        showApp();
    }
});

// Create custom icons
const campusIcon = L.divIcon({
    className: 'custom-div-icon',
    html: "<div class='marker-pin university-pin'><span>🏫</span></div>",
    iconSize: [30, 42],
    iconAnchor: [15, 42]
});

const laundryIcon = L.divIcon({
    className: 'custom-div-icon',
    html: "<div class='marker-pin laundry-pin'><span>🧺</span></div>",
    iconSize: [30, 42],
    iconAnchor: [15, 42]
});

const userLocationIcon = L.divIcon({
    className: 'custom-div-icon',
    html: "<div class='marker-pin user-pin'><span>📍</span></div>",
    iconSize: [30, 42],
    iconAnchor: [15, 42]
});

// Add a marker for Telkom University with custom icon
L.marker([-6.972775814889462, 107.63050136194732], {icon: campusIcon})
    .addTo(map)
    .bindPopup('<b>Telkom University</b><br>Your Campus')
    .openPopup();

let allLaundriesData = [];
const laundryMarkers = L.layerGroup().addTo(map);
let currentUserLocation = null; // Store user's location
let userMarker;
let userCircle;
let routingControl = null; // Variable to hold the routing control

const priceFilterInput = document.getElementById('price-filter');
const speedFilterInput = document.getElementById('speed-filter');
const filterBtn = document.getElementById('filter-btn');
const resetBtn = document.getElementById('reset-btn');
const nearMeBtn = document.getElementById('near-me-btn');
const choroplethBtn = document.getElementById('choropleth-btn');
const loadingIndicator = document.getElementById('loading-indicator');
const statusMessageContainer = document.getElementById('status-message-container');

// Choropleth variables
let choroplethLayer = null;
let showingChoropleth = false;
let districtsData = null;
let legend = null;

// Core function to render laundry markers based on current state
function renderLaundryMarkers(sortByDistanceAfterNearMe = false) {
    laundryMarkers.clearLayers();
    // if (routingControl) { // Decide if route should persist or be cleared on re-render
    //     map.removeControl(routingControl);
    //     routingControl = null;
    // }

    const maxPrice = parseFloat(priceFilterInput.value) || Infinity;
    const maxSpeed = parseFloat(speedFilterInput.value) || Infinity;

    let laundriesToProcess = [...allLaundriesData];

    // Augment with distance if user location is known
    if (currentUserLocation) {
        laundriesToProcess.forEach(laundry => {
            laundry.distance = currentUserLocation.distanceTo([laundry.lat, laundry.lng]);
        });

        // If triggered by "Find Near Me" and no other filters are active, sort by distance
        if (sortByDistanceAfterNearMe && maxPrice === Infinity && maxSpeed === Infinity) {
            laundriesToProcess.sort((a, b) => a.distance - b.distance);
        }
    }

    laundriesToProcess.forEach(laundry => {
        const matchesFilters = laundry.price_per_kg <= maxPrice && laundry.service_speed_days <= maxSpeed;        let popupContent = `<b>${laundry.name}</b>
                            <div class="popup-info">
                                <div><strong>💰 Price:</strong> Rp ${laundry.price_per_kg}/kg</div>
                                <div><strong>⏱️ Speed:</strong> ${laundry.service_speed_days} day(s)</div>
                                <div><strong>🕒 Hours:</strong> ${laundry.opening_hours || 'N/A'}</div>
                                <div><strong>📍 Address:</strong> ${laundry.address || 'N/A'}</div>`;

        if (laundry.distance !== undefined) {
            popupContent += `<div><strong>🚶 Distance:</strong> ${laundry.distance.toFixed(0)} m</div>`;
        }
        
        popupContent += `</div>`;
        
        // Add Get Directions button
        popupContent += `<button class="directions-btn" data-lat="${laundry.lat}" data-lng="${laundry.lng}" data-name="${laundry.name}">Get Directions</button>`;

        const marker = L.marker([laundry.lat, laundry.lng], {icon: laundryIcon});

        if (!matchesFilters) {
            marker.setOpacity(0.4); // Dim markers that don't match filters
        } else {
            marker.setOpacity(1.0); // Ensure matching markers are fully opaque
        }

        marker.bindPopup(popupContent, {
            minWidth: 220, // Larger popup
            autoPan: true, // Map pans to keep popup visible
            autoPanPadding: L.point(50, 50) // Padding for autoPan
        });
        marker.addTo(laundryMarkers);
    });
}

// Function to show status messages
function showStatusMessage(message, type = 'info') { // type can be 'info', 'success', 'error'
    statusMessageContainer.textContent = message;
    statusMessageContainer.className = type; // Resets other classes
    statusMessageContainer.style.display = 'block';
    // Automatically hide after some time, unless it's an error that needs attention
    if (type !== 'error') {
        setTimeout(() => {
            statusMessageContainer.style.display = 'none';
        }, 5000); // Hide after 5 seconds
    }
}

// Function to show/hide loading indicator
function setLoading(isLoading) {
    loadingIndicator.style.display = isLoading ? 'block' : 'none';
}

// Function to fetch laundry data from the backend
async function fetchLaundries() {
    setLoading(true);
    showStatusMessage('Fetching laundry data...', 'info');
    try {
        const response = await fetch('/api/laundries');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allLaundriesData = await response.json();
        renderLaundryMarkers(); // Initial render
        setLoading(false);
        showStatusMessage('Laundry data loaded successfully!', 'success');
    } catch (error) {
        console.error('Error fetching laundries:', error);
        setLoading(false);
        showStatusMessage('Could not fetch laundry data. Please try again later.', 'error');
    }
}

// Function to apply filters
function filterLaundries() {
    renderLaundryMarkers();
    showStatusMessage('Filters applied.', 'info');
}

// Function to reset filters
function resetFilters() {
    priceFilterInput.value = '';
    speedFilterInput.value = '';
    if (routingControl) { // Clear route on reset filters
        map.removeControl(routingControl);
        routingControl = null;
    }
    // Clear choropleth if it exists
    if (choroplethLayer) {
        map.removeLayer(choroplethLayer);
        choroplethLayer = null;
        showingChoropleth = false;
        if (legend) {
            legend.getContainer().style.display = 'none';
        }
    }
    renderLaundryMarkers();
    showStatusMessage('Filters reset.', 'info');
}

// Function to handle finding laundries near the user
function findNearMe() {
    if (routingControl) { // Clear previous route if any when finding new location
        map.removeControl(routingControl);
        routingControl = null;
    }
    if (navigator.geolocation) {
        showStatusMessage('Getting your location...', 'info');
        navigator.geolocation.getCurrentPosition(position => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            currentUserLocation = L.latLng(userLat, userLng); // Update global user location

            map.setView(currentUserLocation, 14); // Center map on user, perhaps a bit more zoomed out

            if (userMarker) map.removeLayer(userMarker);
            userMarker = L.marker(currentUserLocation, {icon: userLocationIcon})
                .addTo(map)
                .bindPopup('<b>Your Location</b>')
                .openPopup();
            
            if (userCircle) map.removeLayer(userCircle);
            userCircle = L.circle(currentUserLocation, {
                radius: 750, // Slightly larger radius
                color: '#764ba2',
                fillColor: 'rgba(102, 126, 234, 0.2)',
                fillOpacity: 0.5
            }).addTo(map);

            renderLaundryMarkers(true); // Re-render, indicating sorting by distance is preferred if no filters
            showStatusMessage('Found laundries near you. Sorted by distance.', 'success');

        }, () => {
            showStatusMessage('Could not get your location. Please ensure location services are enabled and try again.', 'error');
        });
    } else {
        showStatusMessage('Geolocation is not supported by this browser.', 'error');
    }
}

// Function to show route to laundry
function showRouteToLaundry(laundryLat, laundryLng, laundryName) {
    if (!currentUserLocation) {
        showStatusMessage("Please use 'Find Near Me' first to get your current location for directions.", 'error');
        return;
    }

    if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null; // Clear previous route before adding a new one
    }

    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(currentUserLocation.lat, currentUserLocation.lng),
            L.latLng(laundryLat, laundryLng)
        ],
        routeWhileDragging: true,
        show: true, // Show the itinerary panel
        // geocoder: L.Control.Geocoder.nominatim(), // Optional: for searching addresses in the control
        createMarker: function(i, waypoint, n) {
            const markerLabel = i === 0 ? "Your Location" : laundryName;
            const markerOptions = { draggable: true };
            // Optionally, use the existing userMarker for the start point
            if (i === 0 && userMarker) {
                // This is a bit complex as L.Routing.control creates its own markers.
                // For simplicity, we'll let it create new ones, or you could hide the default ones.
            }
            return L.marker(waypoint.latLng, markerOptions).bindPopup(markerLabel);
        }
    }).addTo(map);

    showStatusMessage(`Calculating route to ${laundryName}...`, 'info');

    routingControl.on('routingerror', function(e) {
        console.error("Routing error:", e.error);
        showStatusMessage("Could not find a route. " + (e.error ? e.error.message : "Unknown error."), 'error');
        if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
        }
    });
     routingControl.on('routesfound', function(e) {
        console.log('Routes found:', e.routes);
        const summary = e.routes[0].summary;
        const distanceInKm = (summary.totalDistance / 1000).toFixed(2);
        const timeInMinutes = Math.round(summary.totalTime / 60);
        showStatusMessage(`Route found to ${laundryName}: ${distanceInKm} km, approx. ${timeInMinutes} minutes.`, 'success');
    });
}

// Event listeners
filterBtn.addEventListener('click', filterLaundries);
resetBtn.addEventListener('click', resetFilters);
nearMeBtn.addEventListener('click', findNearMe);
choroplethBtn.addEventListener('click', toggleChoropleth);

// Function to toggle choropleth view
async function toggleChoropleth() {
    if (showingChoropleth) {
        // Remove choropleth if it's already showing
        if (choroplethLayer) {
            map.removeLayer(choroplethLayer);
            choroplethLayer = null;
        }
        showingChoropleth = false;
        showStatusMessage('Heatmap view disabled', 'info');
        return;
    }

    // If we don't have the districts data yet, fetch it
    if (!districtsData) {
        showStatusMessage('Loading district data for heatmap...', 'info');
        districtsData = await fetchDistrictsData();
        if (!districtsData) {
            return; // Error already shown in fetchDistrictsData
        }
    }

    // Calculate price or service speed density for each district
    const useSpeedForChoropleth = document.getElementById('speed-filter').value !== '';
    
    // Clone the districts data to avoid modifying the original
    const geoJsonForChoropleth = JSON.parse(JSON.stringify(districtsData));
      // Calculate density value for each district based on laundries inside it
    geoJsonForChoropleth.features.forEach(district => {
        let totalValue = 0;
        let count = 0;
        
        // Check each laundry against this district's boundaries
        allLaundriesData.forEach(laundry => {
            const laundryPoint = [laundry.lng, laundry.lat];
            // Check if laundry is in this district
            if (isPointInPolygon(laundryPoint, district.geometry.coordinates[0])) {
                // Use either service speed or price based on user selection
                totalValue += useSpeedForChoropleth ? laundry.service_speed_days : laundry.price_per_kg;
                count++;
            }
        });
        
        // Set the density value
        district.properties.density = count > 0 ? (totalValue / count) : 0;
    });
      // Add the choropleth layer
    choroplethLayer = L.choropleth(geoJsonForChoropleth, {
        valueProperty: 'density',
        scale: useSpeedForChoropleth ? ['#1a9850', '#ffffbf', '#d73027'] : ['#d73027', '#ffffbf', '#1a9850'],
        steps: 5,
        mode: 'q', // quantile
        style: {
            color: '#fff',
            weight: 2,
            fillOpacity: 0.7
        },
        onEachFeature: function(feature, layer) {
            const metricName = useSpeedForChoropleth ? 'Average Service Speed' : 'Average Price';
            const value = feature.properties.density;
            const formattedValue = useSpeedForChoropleth 
                ? `${value.toFixed(1)} days` 
                : `Rp ${value.toFixed(0)}/kg`;
            
            layer.bindPopup(`<b>${feature.properties.name}</b><br>${metricName}: ${formattedValue}`);
        }
    }).addTo(map);
    
    showingChoropleth = true;
    const metricType = useSpeedForChoropleth ? 'service speed' : 'price';
    showStatusMessage(`Heatmap view enabled: showing average ${metricType} by district`, 'success');
}

// Helper function to check if a point is in a polygon
function isPointInPolygon(point, polygon) {
    // Simple implementation of point-in-polygon algorithm
    // This is a basic version - more robust implementations exist
    let x = point[0], y = point[1];
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        let xi = polygon[i][0], yi = polygon[i][1];
        let xj = polygon[j][0], yj = polygon[j][1];
        
        let intersect = ((yi > y) != (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
}

// Function to fetch districts GeoJSON data
async function fetchDistrictsData() {
    try {
        const response = await fetch('/districts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching districts data:', error);
        showStatusMessage('Could not load district boundaries. Choropleth view unavailable.', 'error');
        return null;
    }
}

// Event delegation for dynamically added "Get Directions" buttons
// This needs to be attached to an element that exists at page load, like the map or document body.
map.on('popupopen', function(e) {
    if (e.popup && e.popup.getElement) {
        const popupNode = e.popup.getElement();
        const directionsBtn = popupNode.querySelector('.directions-btn');
        if (directionsBtn) {
            // Remove previous listener to avoid duplicates if popup is reopened
            directionsBtn.removeEventListener('click', handleDirectionsClick);
            directionsBtn.addEventListener('click', handleDirectionsClick);
        }
    }
});

function handleDirectionsClick(event) {
    const button = event.target;
    const lat = parseFloat(button.dataset.lat);
    const lng = parseFloat(button.dataset.lng);
    const name = button.dataset.name;
    showRouteToLaundry(lat, lng, name);
    map.closePopup(); // Close the popup after clicking the button
}

// Call fetchLaundries on page load
fetchLaundries();

// Call fetchLaundries on page load
fetchLaundries();
