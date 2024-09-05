const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser'); 
var router = express.Router();
require('dotenv').config();

router.use(bodyParser.urlencoded({ extended: true })); 

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

router.post('/save', async function(req, res, next) {
    console.log(await req);
    const filename = req.query.q;
    const filePath = `websites/users/${await req.user.username}/${await filename}`;
    const fileContent = await req.body.code;

    fs.writeFile(filePath, fileContent, 'utf8', function(err) {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred while saving the file');
        } else {
            res.send('File saved successfully');
        }
    });
});

module.exports = router;