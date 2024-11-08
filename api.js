const express = require('express');
const startdb = require('./startdb');
const router = express.Router();
require("dotenv").config();

router.get('/', async (req, res) => {
	res.render("api", {url: process.env.URL, title: "API"});
})

// Define the route to get all usernames
//router.get('/userlist', async (req, res) => {
//  try {
//    const usernames = await startdb.getAllUserNames();
//    res.json({ usernames });
//  } catch (err) {
//    res.status(500).json({ error: err.message });
//  }
//});

router.get('/websitedata', async (req, res) => {
	if (await req.query.domain) {
		data = await startdb.getWebsiteByDomain(await req.query.domain);
		if (data) {
			res.status(200).send(await data);
		} else {
			res.status(404).send("Website not found :P");
		}
	}	
})

module.exports = router;
