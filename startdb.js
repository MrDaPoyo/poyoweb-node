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
    domain TEXT UNIQUE NOT NULL,
    views INTEGER DEFAULT 0,
    totalSize INTEGER DEFAULT 0,
    FOREIGN KEY (userID) REFERENCES users(id))`);

    db.run(`CREATE TABLE IF NOT EXISTS files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Unique ID for each file
            fileName TEXT NOT NULL,                -- Name of the file
            fileLocation TEXT NOT NULL,            -- Location (path) where the file is stored
            fileFullPath TEXT NOT NULL,
            userID INTEGER NOT NULL,               -- ID of the user who uploaded the file
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Date and time when the file was created
            lastModifiedAt DATETIME DEFAULT CURRENT_TIMESTAMP, -- Last modified date of the file
            fileSize INTEGER DEFAULT 0 NOT NULL,              -- Weight (size) of the file in bytes
            status TEXT DEFAULT 'active',			-- Status of the file (e.g., active, archived, deleted)
            statusLastModifiedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userID) REFERENCES users(id))`);
}

setupDB();

//const getUserIDByName = (userName, callback) => {
//  const selectQuery = `SELECT id FROM users WHERE username = ? LIMIT 1;`;
//
//  db.get(selectQuery, [userName], (err, row) => {
//    if (err) {
//      console.error('Error retrieving userID:', err.message);
//      return;
//    }
//
//if (row) {
//  console.log(`UserID for "${userName}":`, row.id);
//  } else {
//      console.log(`No user found with the name "${userName}".`);
//    }
//  });
//};
function getUserIDByName(username) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) {
                reject(err);
            }
            resolve(row.id);
        })
    });
}


function addFile(fileName, fileLocation, userID, fileSize = 0, status = 'active') {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO files (fileName, fileLocation, userID, fileSize, status)
                       VALUES (?, ?, ?, ?, ?)`;

        db.run(query, [fileName, fileLocation, userID, fileSize, status], function (err) {
            if (err) {
                console.error('Error inserting file:', err.message);
                reject(err);
            } else {
                console.log(`File added with ID: ${this.lastID}`);
                resolve(this.lastID);  // Return the ID of the inserted file
            }
        });
    });
}

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

// Function to add size to the totalSize field for a user's website using the website name
function addSizeByWebsiteName(name, size) {
    db.run('UPDATE websites SET totalSize = totalSize + ? WHERE name = ?', [size, name], (err) => {
        if (err) {
            console.error('Error updating totalSize:', err.message);
        } else {
            console.log(`Added ${size} to totalSize for website: ${name}`);
        }
    });
}

// Function to get the totalSize of a website using the website name
function getTotalSizeByWebsiteName(name) {
    return new Promise((resolve, reject) => {
        db.get('SELECT totalSize FROM websites WHERE name = ?', [name], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row ? row.totalSize : 0);  // Default to 0 if no record is found
            }
        });
    });
}

function insertFileInfo(fileID, updatedData) {
  const selectQuery = `SELECT id FROM files WHERE id = ?`;

  db.get(selectQuery, [fileID], (err, row) => {
    if (err) {
      return console.error(err.message);
    }

    if (row) {
      // File exists, perform update
      const updateQuery = `
        UPDATE files
        SET
          fileName = COALESCE(?, fileName),
          fileLocation = COALESCE(?, fileLocation),
          fileSize = COALESCE(?, fileSize),
          status = COALESCE(?, status),
          lastModifiedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const updateValues = [
        updatedData.fileName || null,
        updatedData.fileLocation || null,
        updatedData.fileSize || null,
        updatedData.status || null,
        fileID
      ];

      db.run(updateQuery, updateValues, function (err) {
        if (err) {
          return console.error(err.message);
        }
        console.log(`Row(s) updated: ${this.changes}`);
      });

    } else {
      // File doesn't exist, perform insert
      const insertQuery = `
        INSERT INTO files (fileName, fileLocation, fileSize, status, createdAt, lastModifiedAt, userID)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)
      `;

      const insertValues = [
        updatedData.fileName,
        updatedData.fileLocation,
        updatedData.fileSize || 0,
        updatedData.status || 'active',
        updatedData.userID  // Assuming you have userID in the updatedData
      ];

      db.run(insertQuery, insertValues, function (err) {
        if (err) {
          return console.error(err.message);
        }
        console.log(`Row inserted with ID: ${this.lastID}`);
      });
    }
  });
}

module.exports = {
    setupDB,
    addFile,
    readUsers,
    findUserByEmail,
    isUserVerifiedById,
    addView,
    retrieveViews,
    getTotalSizeByWebsiteName, // Updated function export
    addSizeByWebsiteName, // Updated function export
    db,
	insertFileInfo,
	getUserIDByName,    
};

