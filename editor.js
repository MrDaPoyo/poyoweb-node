const express = require('express');
const fs = require('fs');
var router = express.Router();
require('dotenv').config();

router.get('/:filename', async function(req, res, next) {
    fs.readFile(`websites/users/${req.user.username}/${req.params.filename}`, 'utf8', function(err, data) {
        if (err) {
            console.log(err);
            res.send('An error occurred');
        } else {
            res.render("editor", { filename: req.params.filename, file: data, url: process.env.URL });
        }
    });
});

module.exports = router;