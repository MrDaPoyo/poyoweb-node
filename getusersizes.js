const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create or connect to the SQLite database
const db = new sqlite3.Database('./poyoweb.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('Error opening the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Function to get the total file size for each user
function getTotalFileSizePerUser() {
    const query = `
        SELECT users.username, SUM(files.fileSize) AS totalFileSize
        FROM files
        INNER JOIN users ON files.userID = users.id
        GROUP BY users.username
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error retrieving file sizes:', err.message);
            return;
        }

        if (rows.length === 0) {
            console.log('No file data found.');
        } else {
            rows.forEach(row => {
                console.log(`User: ${row.username}, Total File Size: ${row.totalFileSize} bytes`);
            });
        }
    });
}

function updateTotalFileSizePerWebsite() {
    const query = `
        SELECT websites.id AS websiteID, SUM(files.fileSize) AS totalFileSize
        FROM files
        INNER JOIN websites ON files.userID = websites.userID
        GROUP BY websites.id
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error retrieving file sizes for websites:', err.message);
            return;
        }

        if (rows.length === 0) {
            console.log('No file data found for websites.');
        } else {
            rows.forEach(row => {
                const updateQuery = `
                    UPDATE websites
                    SET totalSize = ?
                    WHERE id = ?
                `;

                db.run(updateQuery, [row.totalFileSize || 0, row.websiteID], (err) => {
                    if (err) {
                        console.error(`Error updating total size for website with ID ${row.websiteID}:`, err.message);
                    } else {
                        console.log(`Updated total size for website with ID ${row.websiteID}: ${row.totalFileSize} bytes`);
                    }
                });
            });
        }
    });
}

// Function to close the database connection
function closeDB() {
    db.close((err) => {
        if (err) {
            console.error('Error closing the database:', err.message);
        } else {
            console.log('Closed the database connection.');
        }
    });
}

// Export functions to be used in other parts of the application
module.exports = {
    getTotalFileSizePerUser,
    updateTotalFileSizePerWebsite,
    closeDB
};

// Example usage:
updateTotalFileSizePerWebsite();
