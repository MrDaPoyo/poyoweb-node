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
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    verified BOOLEAN DEFAULT FALSE
)`);

    // Create websites table
    db.run(`CREATE TABLE IF NOT EXISTS websites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userID INTEGER NOT NULL,
    name TEXT UNIQUE NOT NULL,
    FOREIGN KEY (userID) REFERENCES users(id))`);
}

setupDB();

function readUsers() {
    db.all('SELECT * FROM users',async (err, rows) => {
            return rows;
    });
}

function findUserByEmail(email) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
            if (err) {
                reject(err);
            }
            resolve(row)
        })
    });
}

async function isUserVerifiedById(id) {
    var verified = db.get('SELECT * FROM users WHERE id = ?', [id]);
    console.log("verified: ", verified.id);
    return verified;
}

module.exports = { setupDB, readUsers, findUserByEmail, isUserVerifiedById, db };