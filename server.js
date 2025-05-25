const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); // Import sqlite3

const app = express();
const port = 3000;

// --- Database Setup ---
const dbPath = path.join(__dirname, 'laundry.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS laundries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            lat REAL NOT NULL,
            lng REAL NOT NULL,
            address TEXT,
            price_per_kg INTEGER,
            service_speed_days REAL,
            opening_hours TEXT
        )`, (err) => {
            if (err) {
                console.error('Error creating table', err.message);
            } else {
                // Seed data if table is empty
                db.get("SELECT COUNT(*) as count FROM laundries", (err, row) => {
                    if (err) {
                        console.error("Error counting laundries", err.message);
                        return;
                    }
                    if (row.count === 0) {
                        console.log("Seeding initial laundry data...");
                        const initialLaundries = [
                            { name: "Dr. Laundry Telkom", lat: -6.979048198068228, lng: 107.63075262254893, address: "Jl. Telekomunikasi No. 1, Sukapura", price_per_kg: 7000, service_speed_days: 1, opening_hours: "08:00 - 20:00" },
                            { name: "Kiloan Express Sukabirus", lat: -6.976600, lng: 107.628500, address: "Jl. Sukabirus No. 10", price_per_kg: 6000, service_speed_days: 2, opening_hours: "07:00 - 21:00" },
                            { name: "Super Cepat Laundry", lat: -6.974200, lng: 107.632000, address: "Jl. PGA No. 5, Terusan Buah Batu", price_per_kg: 8000, service_speed_days: 0.5, opening_hours: "09:00 - 19:00" }
                        ];
                        const stmt = db.prepare("INSERT INTO laundries (name, lat, lng, address, price_per_kg, service_speed_days, opening_hours) VALUES (?, ?, ?, ?, ?, ?, ?)");
                        initialLaundries.forEach(l => {
                            stmt.run(l.name, l.lat, l.lng, l.address, l.price_per_kg, l.service_speed_days, l.opening_hours);
                        });
                        stmt.finalize(err => {
                            if (err) console.error("Error seeding data", err.message);
                            else console.log("Initial data seeded successfully.");
                        });
                    }
                });
            }
        });
    }
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Middleware to parse JSON bodies for POST requests

// API endpoint to get all laundries
app.get('/api/laundries', (req, res) => {
    db.all("SELECT * FROM laundries", [], (err, rows) => {
        if (err) {
            console.error("Error fetching laundries from DB", err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// API endpoint to add a new laundry
app.post('/api/laundries', (req, res) => {
    const { name, lat, lng, address, price_per_kg, service_speed_days, opening_hours } = req.body;
    if (!name || lat === undefined || lng === undefined) {
        return res.status(400).json({ error: "Missing required fields: name, lat, lng" });
    }
    const stmt = db.prepare("INSERT INTO laundries (name, lat, lng, address, price_per_kg, service_speed_days, opening_hours) VALUES (?, ?, ?, ?, ?, ?, ?)");
    stmt.run(name, lat, lng, address, price_per_kg, service_speed_days, opening_hours, function(err) { // Use function keyword to get this.lastID
        if (err) {
            console.error("Error inserting laundry to DB", err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID, ...req.body });
    });
    stmt.finalize();
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Closed the database connection.');
        process.exit(0);
    });
});
