const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bodyParser = require('body-parser');
var router = express.Router();
require('dotenv').config();

router.use(bodyParser.urlencoded({ extended: true }));


router.get('/', async function (req, res) {
    const dirPath = req.query.file ? "/" + req.query.file : "";
    
    if (dirPath.includes("..") || !dirPath.includes(".")) {
        return res.status(404).send("HA! Good try, Hacker :3");
    }

    try {
        await fs.access(`websites/users/${req.user.username}/${dirPath}`);
        const data = await fs.readFile(`websites/users/${req.user.username}/${dirPath}`, 'utf8');
        
        console.log(data);
        res.render("editor", { fileName: req.query.file, fileData: data, url: process.env.URL });
    } catch (err) {
        console.log(err);
        res.status(500).send("File not found :P");
    }
});

router.post('/save', async function (req, res, next) {
    try {
        const filename = req.query.q;
        const basePath = `websites/users/${req.user.username}`;
        const filePath = path.join(basePath, filename); // Construct the file path
        const fileContent = req.body.code;

        // Check if the file already exists
        try {
            await fs.access(filePath); // If no error, the file exists
            await fs.writeFile(filePath, fileContent, 'utf8');
            res.redirect(`/editor/?file=${filename}`);
            
        } catch (err) {
            if (err.code !== 'ENOENT') { // ENOENT means file does not exist, so we can proceed
                throw err; // Re-throw other errors
            }
        }
        
    } catch (err) {
        console.error('Error saving file:', err);
        res.status(500).send('An error occurred while saving the file');
    }
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
