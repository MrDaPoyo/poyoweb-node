const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
var router = express.Router();
require('dotenv').config();

router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', async function (req, res) {
    const dirPath = req.query.file ? "/" + req.query.file : "";
    if (dirPath.includes("..")) {
        res.send("HA! Good try, Hacker :3", 404);
    } else {
        fs.readFile(`websites/users/${req.user.username}/${dirPath}`, 'utf8', function (err, data) {
            if (err) {
                console.log(err);
                res.send('An error occurred');
            } else {
                console.log(data);
                res.render("editor", { fileName: req.query.file, fileData: data, url: process.env.URL });
            }
        });
    }
});

router.post('/save', async function (req, res, next) {
    const filename = req.query.filename;
    const filePath = `websites/users/${await req.user.username}/${filename}`;
    const fileContent = req.query.data;

    fs.writeFile(filePath, fileContent, 'utf8', function (err) {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred while saving the file');
        } else {
            res.redirect(`/?file=${filename}`);
        }
    });
});

router.post('/delete', async function (req, res, next) {
    const filename = req.query.q;
    const filePath = `websites/users/${await req.user.username}/${await req.query.path}`;

    fs.unlink(filePath, function (err) {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred while deleting the file');
        } else {
            res.send('File deleted successfully');
        }
    });
});

module.exports = router;