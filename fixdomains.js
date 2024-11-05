const sqlite3 = require('sqlite3').verbose();

// Get the old domain from command-line arguments
const oldDomain = process.argv[2];

if (!oldDomain) {
  console.error('Please provide the old domain as an argument.');
  process.exit(1);
}

// Connect to the SQLite database
const db = new sqlite3.Database('poyoweb.db', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the database.');
  }
});

// Function to update the domain column
const updateDomains = () => {
  const query = `
    UPDATE websites
    SET domain = name || '.poyoweb.me'
    WHERE domain LIKE '%' || ? || '%'
  `;

  db.run(query, [oldDomain], function (err) {
    if (err) {
      console.error('Error updating domains:', err.message);
    } else {
      console.log(`Successfully updated ${this.changes} records in the websites table.`);
    }
  });
};

// Run the update function
updateDomains();

// Close the database connection
db.close((err) => {
  if (err) {
    console.error('Error closing the database:', err.message);
  } else {
    console.log('Database connection closed.');
  }
});
