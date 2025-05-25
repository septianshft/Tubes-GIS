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
    heroSection.classList.add('hero-hidden');
    appContainer.classList.remove('hidden');
    appContainer.classList.add('flex');
    
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
    appContainer.classList.add('hidden');
    appContainer.classList.remove('flex');
    
    // Give time for the DOM to update
    setTimeout(() => {
        heroSection.classList.remove('hero-hidden');
        heroSection.classList.add('active');
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
    iconSize: [50, 60],
    iconAnchor: [25, 60]
});

const laundryIcon = L.divIcon({
    className: 'custom-div-icon',
    html: "<div class='marker-pin laundry-pin'><span>🧺</span></div>",
    iconSize: [50, 60],
    iconAnchor: [25, 60]
});

const userLocationIcon = L.divIcon({
    className: 'custom-div-icon',
    html: "<div class='marker-pin user-pin'><span>📍</span></div>",
    iconSize: [50, 60],
    iconAnchor: [25, 60]
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

// Search elements
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const searchResults = document.getElementById('search-results');

// Search variables
let searchTimeout;
let currentSearchQuery = '';
let selectedSearchIndex = -1;

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
        }        popupContent += `</div>`;
        
        // Add Get Directions button with conditional styling based on user location
        const hasUserLocation = currentUserLocation !== null;
        const buttonClasses = hasUserLocation 
            ? "directions-btn mt-3 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            : "directions-btn mt-3 w-full bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 opacity-75";
        
        const buttonIcon = hasUserLocation ? "fas fa-route" : "fas fa-location-dot";
        const buttonText = hasUserLocation ? "Get Directions" : "Set Location First";
        
        popupContent += `<button class="${buttonClasses}" data-lat="${laundry.lat}" data-lng="${laundry.lng}" data-name="${laundry.name}">
            <i class="${buttonIcon} text-sm"></i>
            ${buttonText}
        </button>`;

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
    // Clear any existing content and classes
    statusMessageContainer.innerHTML = '';
    statusMessageContainer.className = 'fixed top-4 right-4 z-50 max-w-md';
      // Create message element with Tailwind classes
    const messageEl = document.createElement('div');
    
    // Base classes for all message types
    let classes = 'px-6 py-4 rounded-lg shadow-xl font-medium text-sm border-l-4 backdrop-blur-sm animate-fadeInUp';
    
    // Add type-specific classes
    switch(type) {
        case 'success':
            classes += ' bg-green-50/95 text-green-800 border-green-500';
            break;
        case 'error':
            classes += ' bg-red-50/95 text-red-800 border-red-500';
            break;
        case 'info':
        default:
            classes += ' bg-blue-50/95 text-blue-800 border-blue-500';
            break;
    }
      messageEl.className = classes;
    
    // Add close button for error messages
    if (type === 'error') {
        messageEl.innerHTML = `
            <div class="flex items-start justify-between gap-3">
                <span class="flex-1">${message}</span>
                <button class="error-close-btn flex-shrink-0 text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded hover:bg-red-100" onclick="this.closest('#status-message-container').style.display='none'">
                    <i class="fas fa-times text-xs"></i>
                </button>
            </div>
        `;
    } else {
        messageEl.textContent = message;
    }
    
    statusMessageContainer.appendChild(messageEl);
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

// Search Functions
async function searchLaundries(query) {
    if (!query || query.trim().length < 2) {
        hideSearchResults();
        return;
    }

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&limit=8`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const results = await response.json();
        displaySearchResults(results, query);
    } catch (error) {
        console.error('Error searching laundries:', error);
        showStatusMessage('Search error. Please try again.', 'error');
        hideSearchResults();
    }
}

function displaySearchResults(results, query) {
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="flex flex-col items-center justify-center py-8 px-6 text-gray-500">
                <i class="fas fa-search text-2xl mb-3 text-gray-400"></i>
                <span class="text-sm font-medium">No laundries found for "${query}"</span>
            </div>
        `;
        searchResults.style.display = 'block';
        return;
    }

    results.forEach((laundry, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item px-4 py-3 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 hover:border-blue-200';
        resultItem.dataset.index = index;
        resultItem.dataset.lat = laundry.lat;
        resultItem.dataset.lng = laundry.lng;
        
        // Highlight matching text
        const highlightedName = highlightSearchTerm(laundry.name, query);
        const highlightedAddress = highlightSearchTerm(laundry.address || '', query);
        
        resultItem.innerHTML = `
            <div class="font-semibold text-gray-900 text-sm mb-1">${highlightedName}</div>
            <div class="text-xs text-gray-600 mb-2 leading-relaxed">${highlightedAddress}</div>
            <div class="flex items-center justify-between text-xs">
                <span class="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    <i class="fas fa-tag text-xs"></i>
                    Rp ${laundry.price_per_kg}/kg
                </span>
                <span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                    <i class="fas fa-clock text-xs"></i>
                    ${laundry.service_speed_days} day(s)
                </span>
            </div>
        `;
        
        resultItem.addEventListener('click', () => selectSearchResult(laundry));
        searchResults.appendChild(resultItem);
    });
    
    searchResults.style.display = 'block';
    selectedSearchIndex = -1;
}

function highlightSearchTerm(text, query) {
    if (!text || !query) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function selectSearchResult(laundry) {
    // Center map on selected laundry
    map.setView([laundry.lat, laundry.lng], 17);
    
    // Find and open the popup for this laundry
    laundryMarkers.eachLayer(layer => {
        if (layer.getLatLng().lat === laundry.lat && layer.getLatLng().lng === laundry.lng) {
            layer.openPopup();
        }
    });
    
    // Hide search results and clear input
    hideSearchResults();
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    
    showStatusMessage(`Showing ${laundry.name}`, 'success');
}

function hideSearchResults() {
    searchResults.style.display = 'none';
    searchResults.innerHTML = '';
    selectedSearchIndex = -1;
}

function clearSearch() {
    searchInput.value = '';
    currentSearchQuery = '';
    hideSearchResults();
    clearSearchBtn.style.display = 'none';
    searchInput.focus();
}

function handleSearchNavigation(event) {
    const resultItems = searchResults.querySelectorAll('.search-result-item');
    
    if (resultItems.length === 0) return;
    
    // Remove previous selection
    resultItems.forEach(item => {
        item.classList.remove('bg-blue-100', 'border-blue-300');
        item.classList.add('hover:bg-blue-50', 'hover:border-blue-200');
    });
    
    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault();
            selectedSearchIndex = Math.min(selectedSearchIndex + 1, resultItems.length - 1);
            break;
        case 'ArrowUp':
            event.preventDefault();
            selectedSearchIndex = Math.max(selectedSearchIndex - 1, -1);
            break;
        case 'Enter':
            event.preventDefault();
            if (selectedSearchIndex >= 0 && resultItems[selectedSearchIndex]) {
                resultItems[selectedSearchIndex].click();
            }
            return;
        case 'Escape':
            hideSearchResults();
            searchInput.blur();
            return;
    }
    
    // Apply new selection
    if (selectedSearchIndex >= 0) {
        const selectedItem = resultItems[selectedSearchIndex];
        selectedItem.classList.remove('hover:bg-blue-50', 'hover:border-blue-200');
        selectedItem.classList.add('bg-blue-100', 'border-blue-300');
        selectedItem.scrollIntoView({ block: 'nearest' });
    }
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
    
    // Clear search
    clearSearch();
    
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
        showStatusMessage(`🗺️ Location Required: Please click "Find Near Me" first to enable directions to ${laundryName}.`, 'error');
        
        // Highlight the "Find Near Me" button to guide the user
        const nearMeButton = document.getElementById('near-me-btn');
        if (nearMeButton) {
            nearMeButton.classList.add('animate-pulse');
            setTimeout(() => {
                nearMeButton.classList.remove('animate-pulse');
            }, 3000);
        }
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

// Search event listeners
searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    currentSearchQuery = query;
    
    // Show/hide clear button
    clearSearchBtn.style.display = query.length > 0 ? 'flex' : 'none';
    
    // Debounce search
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        searchLaundries(query);
    }, 300);
});

searchInput.addEventListener('keydown', handleSearchNavigation);

clearSearchBtn.addEventListener('click', clearSearch);

// Click outside to close search results
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        hideSearchResults();
    }
});

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
