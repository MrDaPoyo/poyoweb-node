const sqlite3 = require('sqlite3').verbose();
const { on } = require('events');
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
    views INTEGER DEFAULT 0,
    totalSize INTEGER DEFAULT 0,
    FOREIGN KEY (userID) REFERENCES users(id))`);
}

setupDB();

function readUsers() {
    db.all('SELECT * FROM users', async (err, rows) => {
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
    var verified = db.get('SELECT verified FROM users WHERE id = ?', [id]);
    return verified;
}

function addView(name) {
    db.run('UPDATE websites SET views = views + 1 WHERE name = ?', [name]);
}

async function retrieveViews(name, onViews) {
    const promise = new Promise((resolve, reject) => {
        db.get('SELECT views FROM websites WHERE name = ?', [name], (err, views) => {
            resolve(views);
        });
    })
    promise.then(onViews);
    return promise;
}

// Function to add size to the totalSize field for a user's website using userID
function addSizeByUserID(userID, size) {
    db.run('UPDATE websites SET totalSize = totalSize + ? WHERE userID = ?', [size, userID], (err) => {
        if (err) {
            console.error('Error updating totalSize:', err.message);
        } else {
            console.log(`Added ${size} to totalSize for userID: ${userID}`);
        }
    });
}

// Function to get the totalSize of a user's website using userID
function getTotalSizeByUserID(userID) {
    return new Promise((resolve, reject) => {
        db.get('SELECT totalSize FROM websites WHERE userID = ?', [userID], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row ? row.totalSize : null);
            }
        });
    });
}


module.exports = { setupDB, readUsers, findUserByEmail, isUserVerifiedById, addView, retrieveViews, getTotalSizeByUserID, addSizeByUserID, db };
