const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Create a new database file if it doesn't exist
const db = new sqlite3.Database('./poyoweb.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    }
});

function setupDB() {

    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    email TEXT NOT NULL
)`);

    // Create websites table
    db.run(`CREATE TABLE IF NOT EXISTS websites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userID INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (userID) REFERENCES users(id)
)`);
}

setupDB();

function readUsers() {
    db.all('SELECT * FROM users',async (err, rows) => {
            return rows;
    });
}

module.exports = { setupDB, readUsers, db };