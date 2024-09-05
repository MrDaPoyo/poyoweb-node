const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const dirWalker = require('./snippets/dirWalker');

router.get('/', async (req, res) => {
    try {
        const dirPath = "websites/users/" + await req.user.username + (req.query.dir ? "/" + req.query.dir : "");
        if (dirPath.includes("..")) {
            res.send("HA! Good try, Hacker :3", 404);
        } else {
            const results = await dirWalker("websites/users/" + await req.user.username, dirPath);
            const pastDir = path.relative("websites/users/" + req.user.username, path.dirname(dirPath));
            const cleanPath = path.relative("websites/users/" + req.user.username, dirPath);

            res.render('dashboard', { files: await results, past: pastDir, cleanPath, dashboard: (dirPath == "websites/users/" + await req.user.username) });
        }
    } catch (err) {
        res.send("Directory Not Found. Good try, Hacker :3");
    }
});

router.get('/remove', (req, res) => {
    try {
        fs.unlinkSync("websites/users/" + req.user.username + "/" + req.query.dir);
        res.redirect(`/dashboard?dir=${path.dirname(req.query.dir)}`);
    } catch (err) {
        fs.rmdirSync("websites/users/" + req.user.username + "/" + req.query.dir, { recursive: true });
    }
});

router.post('/create', (req, res) => {
    try {
        var dirname = "websites/users/" + req.user.username + "/" + req.query.dir
        if (dirname.includes("..")) {
            res.send("HA! Good try, Hacker :3", 404);
        } else if (!fs.existsSync(dirname)) {
            dirname.replace(/\\/g, "/");
            if (dirname.includes(".")) {
                fs.writeFileSync(dirname, "");
            } else {
                fs.mkdirSync(dirname);
                res.redirect('/dashboard/?dir=' + req.body.dir);
            }
        } else {
            res.send("File/Directory already exists.");
        }
    } catch (err) {
        console.log(err);
        res.send("Error creating file/directory.");
    }
});

module.exports = router;