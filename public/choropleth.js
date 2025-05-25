// Choropleth implementation for Laundry Locator
// This file extends the main script.js functionality

// Helper function to check if a point is in a polygon
function isPointInPolygon(point, polygon) {
    // Simple implementation of point-in-polygon algorithm
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
    
    // Create our own choropleth implementation
    const getColor = function(d) {
        // Choose color scale based on what we're displaying
        const colorScale = useSpeedForChoropleth ? 
            // For speed (lower is better)
            [
                [0, '#1a9850'],  // Green for fast service
                [1, '#91cf60'],
                [2, '#ffffbf'],  // Yellow for medium
                [3, '#fc8d59'], 
                [4, '#d73027']   // Red for slow service
            ] :
            // For price (lower is better)
            [
                [5000, '#1a9850'],  // Green for cheap
                [6000, '#91cf60'],
                [7000, '#ffffbf'],  // Yellow for medium
                [8000, '#fc8d59'],
                [9000, '#d73027']   // Red for expensive
            ];
            
        // Find appropriate color
        for (let i = 0; i < colorScale.length; i++) {
            if (d <= colorScale[i][0]) {
                return colorScale[i][1];
            }
        }
        return colorScale[colorScale.length - 1][1]; // Return the last color for values above the highest threshold
    };

    // Add the choropleth layer
    choroplethLayer = L.geoJson(geoJsonForChoropleth, {
        style: function(feature) {
            return {
                fillColor: getColor(feature.properties.density),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        },
        onEachFeature: function(feature, layer) {
            const metricName = useSpeedForChoropleth ? 'Average Service Speed' : 'Average Price';
            const value = feature.properties.density;
            const formattedValue = useSpeedForChoropleth 
                ? `${value.toFixed(1)} days` 
                : `Rp ${value.toFixed(0)}/kg`;
            
            layer.bindPopup(`<b>${feature.properties.name}</b><br>${metricName}: ${formattedValue}`);
            
            layer.on({
                mouseover: function(e) {
                    const layer = e.target;
                    layer.setStyle({
                        weight: 5,
                        color: '#666',
                        dashArray: '',
                        fillOpacity: 0.9
                    });
                    layer.bringToFront();
                },
                mouseout: function(e) {
                    choroplethLayer.resetStyle(e.target);
                },
                click: function(e) {
                    map.fitBounds(e.target.getBounds());
                }
            });
        }
    }).addTo(map);
    
    // Add a legend
    if (!legend) {
        legend = L.control({ position: 'bottomright' });
        legend.onAdd = function() {
            const div = L.DomUtil.create('div', 'info legend');
            div.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            div.style.padding = '10px';
            div.style.borderRadius = '5px';
            div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
            
            const grades = useSpeedForChoropleth ? 
                [0, 1, 2, 3, 4] : 
                [5000, 6000, 7000, 8000, 9000];
            
            const labels = [];
            const title = useSpeedForChoropleth ? '<h4>Service Speed (days)</h4>' : '<h4>Price (Rp/kg)</h4>';
            
            div.innerHTML = title;
            
            // Loop through our density intervals and generate a label with a colored square for each interval
            for (let i = 0; i < grades.length; i++) {
                const nextGrade = grades[i + 1];
                labels.push(
                    '<i style="background:' + getColor(grades[i]) + '; width: 18px; height: 18px; float: left; margin-right: 8px; opacity: 0.7;"></i> ' +
                    grades[i] + (nextGrade ? '&ndash;' + nextGrade : '+')
                );
            }
            
            div.innerHTML += labels.join('<br>');
            return div;
        };
        legend.addTo(map);
    } else {
        legend.getContainer().style.display = 'block';
    }
    
    showingChoropleth = true;
    const metricType = useSpeedForChoropleth ? 'service speed' : 'price';
    showStatusMessage(`Heatmap view enabled: showing average ${metricType} by district`, 'success');
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

// Add event listener for the choropleth button
choroplethBtn.addEventListener('click', toggleChoropleth);
