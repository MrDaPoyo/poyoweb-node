const express = require('express');
const fs = require('fs');
const path = require('path');
var router = express.Router();

router.get('/', async function(req, res, next) {
    const dir = path.resolve(__dirname, '../public');
    const results = await walkSync(dir);
    res.json(results);
});
