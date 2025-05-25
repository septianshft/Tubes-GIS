// 🚀 LaundryMap Enhancements
// Enhanced functionality for better user experience

class LaundryMapEnhancements {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        this.recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        this.userPreferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        
        this.init();
    }
      init() {
        this.initTheme();
        this.initMobileMenu();
        this.initQuickFilters();
        this.initFavorites();
        this.initEnhancedSearch();
        this.initKeyboardShortcuts();
        this.initPerformanceOptimizations();
    }
    
    // 🌙 Theme Management
    initTheme() {
        this.applyTheme(this.theme);
        
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }
    
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.theme);
        localStorage.setItem('theme', this.theme);
        
        // Add smooth transition
        document.body.style.transition = 'background-color 0.3s, color 0.3s';
        
        // Show notification
        this.showEnhancedStatusMessage(`Switched to ${this.theme} mode`, 'info');
    }
      applyTheme(theme) {
        const html = document.documentElement;
        const themeIcon = document.getElementById('theme-icon');
        
        if (theme === 'dark') {
            html.classList.add('dark');
            if (themeIcon) {
                themeIcon.className = 'fas fa-sun text-gray-300 text-lg';
            }
        } else {
            html.classList.remove('dark');
            if (themeIcon) {
                themeIcon.className = 'fas fa-moon text-gray-600 text-lg';
            }
        }
    }
    
    // 📱 Mobile Menu Management
    initMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mobileClose = document.getElementById('mobile-close');
        const mobileOverlay = document.getElementById('mobile-overlay');
        const sidebar = document.getElementById('sidebar');
        
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => this.toggleMobileMenu(true));
        }
        
        if (mobileClose) {
            mobileClose.addEventListener('click', () => this.toggleMobileMenu(false));
        }
        
        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', () => this.toggleMobileMenu(false));
        }
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar && !sidebar.classList.contains('-translate-x-full')) {
                this.toggleMobileMenu(false);
            }
        });
          // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) { // lg breakpoint
                this.toggleMobileMenu(false);
            }
        });
        
        // Close mobile menu when clicking on map (for better UX)
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.addEventListener('click', () => {
                if (window.innerWidth < 1024) { // Only on mobile
                    this.toggleMobileMenu(false);
                }
            });
        }
    }
      toggleMobileMenu(show) {
        const sidebar = document.getElementById('sidebar');
        const mobileOverlay = document.getElementById('mobile-overlay');
        
        if (!sidebar || !mobileOverlay) return;
        
        if (show) {
            sidebar.classList.remove('-translate-x-full');
            mobileOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        } else {
            sidebar.classList.add('-translate-x-full');
            mobileOverlay.classList.add('hidden');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }
    
    // 🎯 Quick Filters
    initQuickFilters() {
        const quickFiltersHTML = `
            <div class="quick-filters mb-4">
                <button class="quick-filter-btn" data-filter="nearby">
                    <i class="fas fa-location-arrow mr-1"></i>
                    Nearby
                </button>
                <button class="quick-filter-btn" data-filter="cheapest">
                    <i class="fas fa-money-bill mr-1"></i>
                    Cheapest
                </button>
                <button class="quick-filter-btn" data-filter="fastest">
                    <i class="fas fa-bolt mr-1"></i>
                    Fastest
                </button>
                <button class="quick-filter-btn" data-filter="24-7">
                    <i class="fas fa-clock mr-1"></i>
                    24/7
                </button>
                <button class="quick-filter-btn" data-filter="favorites">
                    <i class="fas fa-heart mr-1"></i>
                    Favorites
                </button>
            </div>
        `;
        
        const sidebar = document.querySelector('.sidebar-content');
        if (sidebar) {
            sidebar.insertAdjacentHTML('afterbegin', quickFiltersHTML);
            this.attachQuickFilterEvents();
        }
    }
    
    attachQuickFilterEvents() {
        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.applyQuickFilter(filter, e.currentTarget);
            });
        });
    }
    
    applyQuickFilter(filter, button) {
        // Remove active class from all buttons
        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        button.classList.add('active');
        
        switch (filter) {
            case 'nearby':
                if (currentUserLocation) {
                    renderLaundryMarkers(true);
                } else {
                    findNearMe();
                }
                break;
            case 'cheapest':
                this.sortLaundries('price');
                break;
            case 'fastest':
                this.sortLaundries('speed');
                break;
            case '24-7':
                this.filter24Hours();
                break;
            case 'favorites':
                this.showFavorites();
                break;
        }
        
        this.showEnhancedStatusMessage(`Applied ${filter} filter`, 'success');
    }
    
    // ⭐ Favorites System
    initFavorites() {
        this.updateFavoritesUI();
    }
    
    toggleFavorite(laundryId, laundryName) {
        const index = this.favorites.indexOf(laundryId);
        
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.showEnhancedStatusMessage(`Removed ${laundryName} from favorites`, 'info');
        } else {
            this.favorites.push(laundryId);
            this.showEnhancedStatusMessage(`Added ${laundryName} to favorites`, 'success');
        }
        
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.updateFavoritesUI();
    }
    
    updateFavoritesUI() {
        // Update heart icons in popups and search results
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const laundryId = btn.dataset.laundryId;
            const isFavorite = this.favorites.includes(parseInt(laundryId));
            
            btn.innerHTML = isFavorite ? 
                '<i class="fas fa-heart text-red-500"></i>' : 
                '<i class="far fa-heart text-gray-400"></i>';
        });
    }
    
    showFavorites() {
        if (this.favorites.length === 0) {
            this.showEnhancedStatusMessage('No favorites yet. Click the heart icon to add favorites!', 'info');
            return;
        }
        
        const favoriteLaundries = allLaundriesData.filter(laundry => 
            this.favorites.includes(laundry.id)
        );
        
        this.displayFilteredResults(favoriteLaundries, 'favorites');
    }
    
    // 🔍 Enhanced Search
    initEnhancedSearch() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            // Add search suggestions
            this.addSearchSuggestions();
            
            // Add recent searches
            this.addRecentSearches();
        }
    }
    
    addToRecentSearches(query) {
        if (query && query.length > 2) {
            this.recentSearches = this.recentSearches.filter(search => search !== query);
            this.recentSearches.unshift(query);
            this.recentSearches = this.recentSearches.slice(0, 5); // Keep only 5 recent searches
            localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
        }
    }
    
    // 📊 Performance Optimizations
    initPerformanceOptimizations() {
        // Debounce search input
        this.debounceSearch();
        
        // Lazy load images
        this.lazyLoadImages();
        
        // Virtual scrolling for large lists
        this.initVirtualScrolling();
    }
    
    debounceSearch() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (e.target.value.length > 2) {
                        this.addToRecentSearches(e.target.value);
                    }
                }, 300);
            });
        }
    }
    
    // ⌨️ Keyboard Shortcuts
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search focus
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }
            
            // Ctrl/Cmd + D for dark mode toggle
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.toggleTheme();
            }
            
            // Escape to clear search/close modals
            if (e.key === 'Escape') {
                this.clearAllFilters();
                hideSearchResults();
            }
        });
    }
    
    // 💫 Enhanced Status Messages
    showEnhancedStatusMessage(message, type = 'info', duration = 3000) {
        const statusContainer = document.getElementById('status-message');
        if (!statusContainer) return;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        
        const colorMap = {
            success: 'bg-green-100 text-green-800 border-green-200',
            error: 'bg-red-100 text-red-800 border-red-200',
            info: 'bg-blue-100 text-blue-800 border-blue-200',
            warning: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
        
        statusContainer.innerHTML = `
            <div class="flex items-center gap-2 px-4 py-3 rounded-lg border ${colorMap[type]} status-message fade-in">
                <i class="${iconMap[type]}"></i>
                <span>${message}</span>
                <button class="ml-auto text-sm opacity-60 hover:opacity-100" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        statusContainer.style.display = 'block';
        
        if (duration > 0) {
            setTimeout(() => {
                const msgElement = statusContainer.querySelector('.status-message');
                if (msgElement) {
                    msgElement.style.opacity = '0';
                    msgElement.style.transform = 'translateY(-10px)';
                    setTimeout(() => msgElement.remove(), 300);
                }
            }, duration);
        }
    }
    
    // 🔧 Utility Methods
    sortLaundries(criteria) {
        let sortedData = [...allLaundriesData];
        
        switch (criteria) {
            case 'price':
                sortedData.sort((a, b) => a.price_per_kg - b.price_per_kg);
                break;
            case 'speed':
                sortedData.sort((a, b) => a.service_speed_days - b.service_speed_days);
                break;
            case 'distance':
                if (currentUserLocation) {
                    sortedData.forEach(laundry => {
                        laundry.distance = currentUserLocation.distanceTo([laundry.lat, laundry.lng]);
                    });
                    sortedData.sort((a, b) => a.distance - b.distance);
                }
                break;
        }
        
        this.displayFilteredResults(sortedData, criteria);
    }
    
    filter24Hours() {
        const filtered = allLaundriesData.filter(laundry => 
            laundry.opening_hours && (
                laundry.opening_hours.includes('24') || 
                laundry.opening_hours.includes('00:00 - 24:00') ||
                laundry.opening_hours.includes('24/7')
            )
        );
        
        this.displayFilteredResults(filtered, '24-hour');
    }
    
    displayFilteredResults(data, filterType) {
        // Clear current markers
        laundryMarkers.clearLayers();
        
        // Display filtered data
        data.forEach(laundry => {
            const marker = L.marker([laundry.lat, laundry.lng], {icon: laundryIcon});
            
            const popupContent = this.createEnhancedPopup(laundry);
            marker.bindPopup(popupContent, {
                minWidth: 220,
                autoPan: true,
                autoPanPadding: L.point(50, 50)
            });
            
            marker.addTo(laundryMarkers);
        });
        
        // Update bounds if data available
        if (data.length > 0) {
            const group = new L.featureGroup(laundryMarkers.getLayers());
            map.fitBounds(group.getBounds().pad(0.1));
        }
    }
    
    createEnhancedPopup(laundry) {
        const isFavorite = this.favorites.includes(laundry.id);
        const heartIcon = isFavorite ? 'fas fa-heart text-red-500' : 'far fa-heart text-gray-400';
        
        return `
            <div class="laundry-popup">
                <div class="flex justify-between items-start mb-2">
                    <b class="text-lg">${laundry.name}</b>
                    <button class="favorite-btn" data-laundry-id="${laundry.id}" onclick="enhancements.toggleFavorite(${laundry.id}, '${laundry.name}')">
                        <i class="${heartIcon}"></i>
                    </button>
                </div>
                <div class="popup-info space-y-1">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-money-bill-wave text-green-600"></i>
                        <span>Rp ${laundry.price_per_kg}/kg</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="fas fa-clock text-blue-600"></i>
                        <span>${laundry.service_speed_days} day(s)</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="fas fa-door-open text-purple-600"></i>
                        <span>${laundry.opening_hours || 'N/A'}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="fas fa-map-marker-alt text-red-600"></i>
                        <span class="text-sm">${laundry.address || 'N/A'}</span>
                    </div>
                    ${laundry.distance ? `
                        <div class="flex items-center gap-2">
                            <i class="fas fa-route text-indigo-600"></i>
                            <span>${laundry.distance.toFixed(0)}m away</span>
                        </div>
                    ` : ''}
                </div>
                <div class="mt-3 flex gap-2">
                    <button class="directions-btn flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-3 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2" 
                            data-lat="${laundry.lat}" data-lng="${laundry.lng}" data-name="${laundry.name}">
                        <i class="fas fa-route text-sm"></i>
                        <span class="text-sm">Directions</span>
                    </button>
                    <button class="share-btn bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors" 
                            onclick="enhancements.shareLaundry(${laundry.id}, '${laundry.name}')">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    shareLaundry(laundryId, laundryName) {
        if (navigator.share) {
            navigator.share({
                title: `${laundryName} - LaundryMap`,
                text: `Check out ${laundryName} on LaundryMap!`,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(`${laundryName} - ${window.location.href}`).then(() => {
                this.showEnhancedStatusMessage('Link copied to clipboard!', 'success');
            });
        }
    }
    
    clearAllFilters() {
        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Reset filters
        document.getElementById('price-filter').value = '';
        document.getElementById('speed-filter').value = '';
        
        // Re-render all markers
        renderLaundryMarkers();
        
        this.showEnhancedStatusMessage('All filters cleared', 'info');
    }
    
    // Additional utility methods
    lazyLoadImages() {
        // Implementation for lazy loading images when they're added
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('skeleton');
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    initVirtualScrolling() {
        // Implementation for virtual scrolling in search results
        // This would be useful when there are many search results
    }
    
    addSearchSuggestions() {
        // Implementation for search suggestions based on popular searches
    }
    
    addRecentSearches() {
        // Implementation for showing recent searches
    }
}

// Initialize enhancements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.enhancements = new LaundryMapEnhancements();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LaundryMapEnhancements;
}
