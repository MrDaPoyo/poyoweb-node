const express = require('express');
const startdb = require('./startdb');
const router = express.Router();
require("dotenv").config();

router.get('/', async (req, res) => {
	res.render("api", {url: process.env.URL, title: "API"});
})

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
