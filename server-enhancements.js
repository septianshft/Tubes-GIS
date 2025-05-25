// 🚀 Enhanced Server Features for LaundryMap
// Additional API endpoints and middleware for improved functionality

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');

// Middleware setup function
function setupMiddleware(app) {
    // Security middleware
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
                scriptSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
                imgSrc: ["'self'", "data:", "https:", "http:"],
                connectSrc: ["'self'", "https:", "http:"],
                fontSrc: ["'self'", "https:", "http:"],
                frameSrc: ["'none'"],
                objectSrc: ["'none'"]
            }
        }
    }));
    
    // Compression middleware
    app.use(compression());
    
    // CORS middleware
    app.use(cors({
        origin: process.env.NODE_ENV === 'production' ? 
            ['https://yourdomain.com'] : 
            ['http://localhost:3000', 'http://127.0.0.1:3000'],
        credentials: true
    }));
    
    // Rate limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: {
            error: 'Too many requests from this IP, please try again later.',
            retryAfter: 15 * 60 * 1000
        }
    });
    app.use(limiter);
    
    // Search rate limiting (more restrictive)
    const searchLimiter = rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 30, // 30 search requests per minute
        message: {
            error: 'Search rate limit exceeded, please try again later.',
            retryAfter: 60 * 1000
        }
    });
    app.use('/api/search', searchLimiter);
    
    console.log('✅ Middleware configured successfully');
}

// Enhanced API endpoints
function setupEnhancedRoutes(app, db) {
    
    // 📊 Analytics endpoint
    app.post('/api/analytics', (req, res) => {
        const { id, name, timestamp, sessionId, data } = req.body;
        
        // In production, you'd save this to a proper analytics database
        console.log('📊 Analytics Event:', { name, sessionId, data });
        
        // For now, just acknowledge receipt
        res.json({ 
            success: true, 
            message: 'Analytics event recorded',
            timestamp: new Date().toISOString()
        });
    });
    
    // 📈 Analytics dashboard data
    app.get('/api/analytics/dashboard', (req, res) => {
        // In production, this would query your analytics database
        // For demo purposes, return mock data
        const mockAnalytics = {
            totalUsers: 1250,
            activeUsers: 85,
            totalSearches: 3420,
            popularLaundries: [
                { name: 'Dr. Laundry Telkom', visits: 142 },
                { name: 'Sukabirus Express', visits: 98 },
                { name: 'Fresh & Clean Laundry', visits: 87 }
            ],
            searchTrends: {
                topQueries: ['24 hour', 'cheap', 'fast', 'near telkom', 'sukabirus'],
                avgResultsPerSearch: 5.3,
                avgSearchTime: 145
            },
            deviceBreakdown: {
                mobile: 68,
                desktop: 25,
                tablet: 7
            },
            timeRanges: {
                morning: 25,
                afternoon: 45,
                evening: 20,
                night: 10
            }
        };
        
        res.json(mockAnalytics);
    });
    
    // 🔍 Advanced search with filters
    app.get('/api/search/advanced', (req, res) => {
        const { 
            q, 
            maxPrice, 
            maxSpeed, 
            openNow, 
            lat, 
            lng, 
            radius = 5000, 
            sortBy = 'relevance',
            limit = 20 
        } = req.query;
        
        let query = 'SELECT * FROM laundries WHERE 1=1';
        let params = [];
        
        // Text search
        if (q && q.trim().length >= 2) {
            const searchTerm = `%${q.trim()}%`;
            query += ' AND (name LIKE ? OR address LIKE ?)';
            params.push(searchTerm, searchTerm);
        }
        
        // Price filter
        if (maxPrice) {
            query += ' AND price_per_kg <= ?';
            params.push(parseInt(maxPrice));
        }
        
        // Speed filter
        if (maxSpeed) {
            query += ' AND service_speed_days <= ?';
            params.push(parseFloat(maxSpeed));
        }
        
        // Open now filter (simplified - would need proper time parsing)
        if (openNow === 'true') {
            query += ' AND (opening_hours LIKE "%24%" OR opening_hours LIKE "%00:00 - 24:00%")';
        }
        
        // Add sorting
        switch (sortBy) {
            case 'price':
                query += ' ORDER BY price_per_kg ASC';
                break;
            case 'speed':
                query += ' ORDER BY service_speed_days ASC';
                break;
            case 'name':
                query += ' ORDER BY name ASC';
                break;
            default:
                query += ' ORDER BY name ASC';
        }
        
        query += ' LIMIT ?';
        params.push(parseInt(limit));
        
        db.all(query, params, (err, rows) => {
            if (err) {
                console.error('Advanced search error:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            
            // Calculate distances if location provided
            if (lat && lng) {
                rows.forEach(laundry => {
                    const distance = calculateDistance(
                        parseFloat(lat), 
                        parseFloat(lng), 
                        laundry.lat, 
                        laundry.lng
                    );
                    laundry.distance = distance;
                });
                
                // Sort by distance if within radius
                if (sortBy === 'distance') {
                    rows = rows
                        .filter(laundry => laundry.distance <= radius)
                        .sort((a, b) => a.distance - b.distance);
                }
            }
            
            res.json({
                results: rows,
                count: rows.length,
                searchParams: req.query,
                timestamp: new Date().toISOString()
            });
        });
    });
    
    // 📍 Nearby laundries with enhanced filtering
    app.get('/api/laundries/nearby', (req, res) => {
        const { lat, lng, radius = 2000, limit = 10 } = req.query;
        
        if (!lat || !lng) {
            return res.status(400).json({ 
                error: 'Latitude and longitude are required' 
            });
        }
        
        db.all('SELECT * FROM laundries', [], (err, rows) => {
            if (err) {
                console.error('Nearby search error:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            
            // Calculate distances and filter
            const nearbyLaundries = rows
                .map(laundry => ({
                    ...laundry,
                    distance: calculateDistance(
                        parseFloat(lat), 
                        parseFloat(lng), 
                        laundry.lat, 
                        laundry.lng
                    )
                }))
                .filter(laundry => laundry.distance <= radius)
                .sort((a, b) => a.distance - b.distance)
                .slice(0, parseInt(limit));
            
            res.json({
                results: nearbyLaundries,
                center: { lat: parseFloat(lat), lng: parseFloat(lng) },
                radius: radius,
                count: nearbyLaundries.length
            });
        });
    });
    
    // 🏆 Top rated laundries (mock data for now)
    app.get('/api/laundries/top-rated', (req, res) => {
        const { limit = 5 } = req.query;
        
        db.all('SELECT * FROM laundries ORDER BY price_per_kg ASC, service_speed_days ASC LIMIT ?', 
               [parseInt(limit)], (err, rows) => {
            if (err) {
                console.error('Top rated error:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            
            // Add mock ratings
            const topRated = rows.map((laundry, index) => ({
                ...laundry,
                rating: 4.5 - (index * 0.1), // Mock rating
                reviewCount: 50 - (index * 5), // Mock review count
                isTopRated: true
            }));
            
            res.json(topRated);
        });
    });
    
    // 📊 Laundry statistics
    app.get('/api/stats', (req, res) => {
        const stats = {};
        
        // Get total count
        db.get('SELECT COUNT(*) as total FROM laundries', [], (err, countResult) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            stats.totalLaundries = countResult.total;
            
            // Get price statistics
            db.get(`SELECT 
                AVG(price_per_kg) as avgPrice,
                MIN(price_per_kg) as minPrice,
                MAX(price_per_kg) as maxPrice
                FROM laundries`, [], (err, priceResult) => {
                
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                
                stats.pricing = {
                    average: Math.round(priceResult.avgPrice),
                    minimum: priceResult.minPrice,
                    maximum: priceResult.maxPrice
                };
                
                // Get speed statistics
                db.get(`SELECT 
                    AVG(service_speed_days) as avgSpeed,
                    MIN(service_speed_days) as minSpeed,
                    MAX(service_speed_days) as maxSpeed
                    FROM laundries`, [], (err, speedResult) => {
                    
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    
                    stats.serviceSpeed = {
                        average: speedResult.avgSpeed.toFixed(1),
                        fastest: speedResult.minSpeed,
                        slowest: speedResult.maxSpeed
                    };
                    
                    stats.lastUpdated = new Date().toISOString();
                    res.json(stats);
                });
            });
        });
    });
    
    // 🔧 Health check endpoint
    app.get('/api/health', (req, res) => {
        db.get('SELECT COUNT(*) as count FROM laundries', [], (err, result) => {
            if (err) {
                res.status(500).json({
                    status: 'unhealthy',
                    database: 'error',
                    error: err.message
                });
                return;
            }
            
            res.json({
                status: 'healthy',
                database: 'connected',
                laundryCount: result.count,
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage()
            });
        });
    });
    
    console.log('✅ Enhanced API routes configured');
}

// Utility function to calculate distance between two points
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c; // Distance in meters
}

// Error handling middleware
function setupErrorHandling(app) {
    // 404 handler
    app.use((req, res, next) => {
        res.status(404).json({
            error: 'Not Found',
            message: `Route ${req.originalUrl} not found`,
            timestamp: new Date().toISOString()
        });
    });
    
    // Global error handler
    app.use((err, req, res, next) => {
        console.error('Global error handler:', err);
        
        res.status(err.status || 500).json({
            error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
            timestamp: new Date().toISOString(),
            ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
        });
    });
    
    console.log('✅ Error handling configured');
}

// Database optimization
function optimizeDatabase(db) {
    // Create indexes for better performance
    const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_laundries_price ON laundries(price_per_kg)',
        'CREATE INDEX IF NOT EXISTS idx_laundries_speed ON laundries(service_speed_days)',
        'CREATE INDEX IF NOT EXISTS idx_laundries_location ON laundries(lat, lng)',
        'CREATE INDEX IF NOT EXISTS idx_laundries_name ON laundries(name)'
    ];
    
    indexes.forEach(indexQuery => {
        db.run(indexQuery, (err) => {
            if (err) {
                console.error('Index creation error:', err.message);
            }
        });
    });
    
    // Enable WAL mode for better concurrent performance
    db.run('PRAGMA journal_mode=WAL', (err) => {
        if (err) {
            console.error('WAL mode error:', err.message);
        } else {
            console.log('✅ Database WAL mode enabled');
        }
    });
    
    console.log('✅ Database optimization completed');
}

module.exports = {
    setupMiddleware,
    setupEnhancedRoutes,
    setupErrorHandling,
    optimizeDatabase,
    calculateDistance
};
