const express = require('express');
const cors = require('cors');
const db = require('./event_db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 1. GET /api/events/home
app.get('/api/events/home', (req, res) => {
    const sql = `SELECT e.*, c.category_name, o.org_name
                 FROM events e
                 JOIN categories c ON e.category_id = c.category_id
                 JOIN organisations o ON e.org_id = o.org_id
                 WHERE e.is_suspended = 0 AND e.event_date >= NOW()
                 ORDER BY e.event_date ASC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2. GET /api/categories
app.get('/api/categories', (req, res) => {
    db.query("SELECT * FROM categories", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 3. GET /api/events/search
app.get('/api/events/search', (req, res) => {
    let baseSql = `SELECT e.*, c.category_name, o.org_name FROM events e
                   JOIN categories c ON e.category_id = c.category_id
                   JOIN organisations o ON e.org_id = o.org_id
                   WHERE e.is_suspended = 0 `;
    let params = [];

    console.log("=== SEARCH REQUEST ===");
    console.log("Query params:", req.query);

    if (req.query.date) {
        baseSql += " AND DATE(e.event_date) = ? ";
        params.push(req.query.date);
    }
    if (req.query.location) {
        baseSql += " AND e.location LIKE ? ";
        params.push(`%${req.query.location}%`);
    }
    if (req.query.categoryId) {
        baseSql += " AND e.category_id = ? ";
        params.push(req.query.categoryId);
    }
    baseSql += " ORDER BY e.event_date";

    console.log("Final SQL:", baseSql);
    console.log("Params:", params);

    db.query(baseSql, params, (err, results) => {
        if (err) {
            console.log("SQL ERROR:", err);
            return res.status(500).json({ error: err.message });
        }
        console.log("Result count:", results.length);
        res.json(results);
    });
});

// 4. GET /api/events/:id
app.get('/api/events/:id', (req, res) => {
    const id = req.params.id;
    const sql = `SELECT e.*, c.category_name, o.org_name, o.contact_info
                 FROM events e
                 JOIN categories c ON e.category_id = c.category_id
                 JOIN organisations o ON e.org_id = o.org_id
                 WHERE e.event_id = ? AND e.is_suspended = 0`;
    db.query(sql, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row.length === 0) return res.status(404).json({ message: "Event not found" });
        res.json(row[0]);
    });
});

app.listen(PORT, () => {
    console.log(`API Server running on http://localhost:${PORT}`);
});