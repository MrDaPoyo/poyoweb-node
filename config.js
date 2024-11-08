const express = require('express');
const router = express.Router();
require("dotenv").config();

router.get("/", async (req, res) => {
	res.render("userConfig", {url: process.env.URL, apiKey: "TestApiKey"});
})

module.exports = router;
