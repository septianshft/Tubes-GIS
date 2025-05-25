// 📊 LaundryMap Analytics Dashboard
// Simple analytics tracking and dashboard for usage insights

class LaundryMapAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.startTime = new Date();
        this.events = [];
        this.userMetrics = {
            searchCount: 0,
            locationRequests: 0,
            directionsRequested: 0,
            favoritesAdded: 0,
            filtersUsed: 0,
            timeSpent: 0
        };
        
        this.init();
    }
    
    init() {
        this.loadStoredMetrics();
        this.trackPageLoad();
        this.setupEventListeners();
        this.startSessionTracking();
        
        // Create admin dashboard if user is admin
        if (this.isAdmin()) {
            this.createAdminDashboard();
        }
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    isAdmin() {
        // Simple admin check - in production, use proper authentication
        return localStorage.getItem('isAdmin') === 'true' || 
               window.location.search.includes('admin=true');
    }
    
    // 📈 Event Tracking
    trackEvent(eventName, data = {}) {
        const event = {
            id: this.generateEventId(),
            name: eventName,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            data: data,
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        this.events.push(event);
        this.updateMetrics(eventName, data);
        this.saveToStorage();
        
        // Send to server in production
        if (this.shouldSendToServer()) {
            this.sendEventToServer(event);
        }
        
        console.log('📊 Analytics Event:', eventName, data);
    }
    
    generateEventId() {
        return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }
    
    updateMetrics(eventName, data) {
        switch (eventName) {
            case 'search_performed':
                this.userMetrics.searchCount++;
                break;
            case 'location_requested':
                this.userMetrics.locationRequests++;
                break;
            case 'directions_requested':
                this.userMetrics.directionsRequested++;
                break;
            case 'favorite_added':
                this.userMetrics.favoritesAdded++;
                break;
            case 'filter_applied':
                this.userMetrics.filtersUsed++;
                break;
        }
    }
    
    // 🎯 Specific Tracking Methods
    trackPageLoad() {
        this.trackEvent('page_load', {
            loadTime: performance.now(),
            referrer: document.referrer,
            screenResolution: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            deviceType: this.getDeviceType()
        });
    }
    
    trackSearch(query, resultsCount, timeToResults) {
        this.trackEvent('search_performed', {
            query: query,
            resultsCount: resultsCount,
            timeToResults: timeToResults,
            queryLength: query.length
        });
    }
    
    trackLocationRequest(success, accuracy = null) {
        this.trackEvent('location_requested', {
            success: success,
            accuracy: accuracy,
            timestamp: new Date().toISOString()
        });
    }
    
    trackDirectionsRequest(laundryName, distance = null) {
        this.trackEvent('directions_requested', {
            laundryName: laundryName,
            distance: distance,
            timestamp: new Date().toISOString()
        });
    }
    
    trackFilterUsage(filterType, filterValue) {
        this.trackEvent('filter_applied', {
            filterType: filterType,
            filterValue: filterValue,
            timestamp: new Date().toISOString()
        });
    }
    
    trackError(errorType, errorMessage, context = {}) {
        this.trackEvent('error_occurred', {
            errorType: errorType,
            errorMessage: errorMessage,
            context: context,
            timestamp: new Date().toISOString()
        });
    }
    
    trackPerformance(metricName, value, unit = 'ms') {
        this.trackEvent('performance_metric', {
            metricName: metricName,
            value: value,
            unit: unit,
            timestamp: new Date().toISOString()
        });
    }
    
    // 📱 Device & Environment Detection
    getDeviceType() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }
    
    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        
        if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Edge')) browser = 'Edge';
        
        return {
            browser: browser,
            userAgent: ua,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        };
    }
    
    // 💾 Data Storage & Retrieval
    saveToStorage() {
        try {
            localStorage.setItem('laundrymap_metrics', JSON.stringify(this.userMetrics));
            localStorage.setItem('laundrymap_session', JSON.stringify({
                sessionId: this.sessionId,
                startTime: this.startTime,
                eventCount: this.events.length
            }));
        } catch (error) {
            console.warn('Failed to save analytics to localStorage:', error);
        }
    }
    
    loadStoredMetrics() {
        try {
            const stored = localStorage.getItem('laundrymap_metrics');
            if (stored) {
                this.userMetrics = { ...this.userMetrics, ...JSON.parse(stored) };
            }
        } catch (error) {
            console.warn('Failed to load stored metrics:', error);
        }
    }
    
    // 🚀 Session Management
    startSessionTracking() {
        // Track time spent
        setInterval(() => {
            this.userMetrics.timeSpent = Math.floor((new Date() - this.startTime) / 1000);
        }, 5000);
        
        // Track when user leaves
        window.addEventListener('beforeunload', () => {
            this.trackEvent('session_end', {
                duration: this.userMetrics.timeSpent,
                eventCount: this.events.length
            });
        });
        
        // Track visibility changes
        document.addEventListener('visibilitychange', () => {
            this.trackEvent('visibility_change', {
                hidden: document.hidden,
                timeSpent: this.userMetrics.timeSpent
            });
        });
    }
    
    // 🎛️ Admin Dashboard
    createAdminDashboard() {
        const dashboardHTML = `
            <div id="analytics-dashboard" style="
                position: fixed;
                bottom: 20px;
                left: 20px;
                width: 300px;
                max-height: 400px;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 12px;
                overflow: hidden;
            ">
                <div style="
                    background: #3b82f6;
                    color: white;
                    padding: 8px 12px;
                    font-weight: 600;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <span>📊 Analytics Dashboard</span>
                    <button onclick="document.getElementById('analytics-dashboard').style.display='none'" 
                            style="background: none; border: none; color: white; font-size: 14px; cursor: pointer;">×</button>
                </div>
                <div id="dashboard-content" style="padding: 12px; overflow-y: auto; max-height: 350px;">
                    <div style="margin-bottom: 10px;">
                        <strong>Current Session</strong>
                        <div>ID: ${this.sessionId.slice(-8)}</div>
                        <div>Time: <span id="session-time">${this.userMetrics.timeSpent}s</span></div>
                        <div>Events: <span id="event-count">${this.events.length}</span></div>
                    </div>
                    
                    <div style="margin-bottom: 10px;">
                        <strong>User Metrics</strong>
                        <div>Searches: ${this.userMetrics.searchCount}</div>
                        <div>Location Requests: ${this.userMetrics.locationRequests}</div>
                        <div>Directions: ${this.userMetrics.directionsRequested}</div>
                        <div>Favorites: ${this.userMetrics.favoritesAdded}</div>
                        <div>Filters Used: ${this.userMetrics.filtersUsed}</div>
                    </div>
                    
                    <div style="margin-bottom: 10px;">
                        <strong>Environment</strong>
                        <div>Device: ${this.getDeviceType()}</div>
                        <div>Online: ${navigator.onLine ? '✅' : '❌'}</div>
                        <div>Browser: ${this.getBrowserInfo().browser}</div>
                    </div>
                    
                    <div>
                        <button onclick="analytics.exportData()" style="
                            background: #10b981;
                            color: white;
                            border: none;
                            padding: 6px 12px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 11px;
                            margin-right: 5px;
                        ">Export Data</button>
                        
                        <button onclick="analytics.clearData()" style="
                            background: #ef4444;
                            color: white;
                            border: none;
                            padding: 6px 12px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 11px;
                        ">Clear Data</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', dashboardHTML);
        
        // Update dashboard every 5 seconds
        setInterval(() => {
            this.updateDashboard();
        }, 5000);
    }
    
    updateDashboard() {
        const sessionTimeEl = document.getElementById('session-time');
        const eventCountEl = document.getElementById('event-count');
        
        if (sessionTimeEl) sessionTimeEl.textContent = this.userMetrics.timeSpent + 's';
        if (eventCountEl) eventCountEl.textContent = this.events.length;
    }
    
    // 📤 Data Export & Management
    exportData() {
        const exportData = {
            session: {
                id: this.sessionId,
                startTime: this.startTime,
                duration: this.userMetrics.timeSpent
            },
            metrics: this.userMetrics,
            events: this.events,
            browser: this.getBrowserInfo(),
            exportTime: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laundrymap-analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.trackEvent('data_exported', { eventCount: this.events.length });
    }
    
    clearData() {
        if (confirm('Are you sure you want to clear all analytics data?')) {
            this.events = [];
            this.userMetrics = {
                searchCount: 0,
                locationRequests: 0,
                directionsRequested: 0,
                favoritesAdded: 0,
                filtersUsed: 0,
                timeSpent: 0
            };
            
            localStorage.removeItem('laundrymap_metrics');
            localStorage.removeItem('laundrymap_session');
            
            this.trackEvent('data_cleared');
            location.reload();
        }
    }
    
    // 🌐 Server Communication
    shouldSendToServer() {
        // In development, don't send to server
        return window.location.hostname !== 'localhost' && 
               window.location.hostname !== '127.0.0.1';
    }
    
    async sendEventToServer(event) {
        try {
            await fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            });
        } catch (error) {
            console.warn('Failed to send analytics to server:', error);
        }
    }
    
    // 📊 Public API for Integration
    setupEventListeners() {
        // Integrate with existing search functionality
        const originalSearchFunction = window.searchLaundries;
        if (originalSearchFunction) {
            window.searchLaundries = async (query) => {
                const startTime = performance.now();
                const result = await originalSearchFunction(query);
                const endTime = performance.now();
                
                this.trackSearch(query, result?.length || 0, endTime - startTime);
                return result;
            };
        }
        
        // Track clicks on map markers
        document.addEventListener('click', (e) => {
            if (e.target.closest('.leaflet-marker-icon')) {
                this.trackEvent('marker_clicked', {
                    timestamp: new Date().toISOString()
                });
            }
        });
        
        // Track errors
        window.addEventListener('error', (e) => {
            this.trackError('javascript_error', e.message, {
                filename: e.filename,
                line: e.lineno,
                column: e.colno
            });
        });
    }
    
    // 📈 Real-time Insights
    getInsights() {
        const totalEvents = this.events.length;
        const sessionDuration = this.userMetrics.timeSpent;
        
        return {
            engagementScore: this.calculateEngagementScore(),
            mostUsedFeature: this.getMostUsedFeature(),
            searchEfficiency: this.getSearchEfficiency(),
            sessionHealth: sessionDuration > 60 ? 'good' : 'short',
            recommendations: this.getRecommendations()
        };
    }
    
    calculateEngagementScore() {
        const { searchCount, locationRequests, directionsRequested, favoritesAdded } = this.userMetrics;
        const timeSpent = this.userMetrics.timeSpent;
        
        // Simple engagement calculation
        const actionScore = (searchCount * 2) + (locationRequests * 3) + (directionsRequested * 4) + (favoritesAdded * 5);
        const timeScore = Math.min(timeSpent / 60, 10); // Max 10 points for time
        
        return Math.min(Math.round((actionScore + timeScore) / 2), 100);
    }
    
    getMostUsedFeature() {
        const features = {
            search: this.userMetrics.searchCount,
            location: this.userMetrics.locationRequests,
            directions: this.userMetrics.directionsRequested,
            favorites: this.userMetrics.favoritesAdded,
            filters: this.userMetrics.filtersUsed
        };
        
        return Object.keys(features).reduce((a, b) => features[a] > features[b] ? a : b);
    }
    
    getSearchEfficiency() {
        const searchEvents = this.events.filter(e => e.name === 'search_performed');
        if (searchEvents.length === 0) return 'N/A';
        
        const avgResultsCount = searchEvents.reduce((sum, e) => sum + (e.data.resultsCount || 0), 0) / searchEvents.length;
        const avgSearchTime = searchEvents.reduce((sum, e) => sum + (e.data.timeToResults || 0), 0) / searchEvents.length;
        
        return {
            averageResults: Math.round(avgResultsCount),
            averageTime: Math.round(avgSearchTime) + 'ms'
        };
    }
    
    getRecommendations() {
        const recommendations = [];
        
        if (this.userMetrics.searchCount === 0) {
            recommendations.push('Try using the search feature to find specific laundries');
        }
        
        if (this.userMetrics.locationRequests === 0) {
            recommendations.push('Use "Find Near Me" to discover laundries close to you');
        }
        
        if (this.userMetrics.favoritesAdded === 0) {
            recommendations.push('Add favorites by clicking the heart icon on laundries you like');
        }
        
        return recommendations;
    }
}

// Initialize analytics
document.addEventListener('DOMContentLoaded', () => {
    window.analytics = new LaundryMapAnalytics();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LaundryMapAnalytics;
}
