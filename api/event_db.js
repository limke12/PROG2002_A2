const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Lm050623',
    database: 'charityevents_db'
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed: ", err);
    } else {
        console.log("✅ Connected to charityevents_db database");
    }
});

module.exports = db;