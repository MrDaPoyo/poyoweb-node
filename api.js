const express = require('express');
const startdb = require('./startdb');

const router = express.Router();

// Define the route to get all usernames
router.get('/userlist', async (req, res) => {
  try {
    const usernames = await startdb.getAllUserNames();
    res.json({ usernames });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
