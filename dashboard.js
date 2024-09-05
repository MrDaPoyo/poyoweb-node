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

router.post('/remove', (req, res) => {
    try {
        fs.unlinkSync("websites/users/" + req.user.username + "/" + req.body.cleanPath);
        res.redirect('/dashboard');
    } catch (err) {
        throw err;
    }
});

router.post('/create', (req, res) => {
    try {
        fs.writeFileSync(req.body.path, "");
        res.redirect('/dashboard/'+req.body.dir);
    } catch (err) {
        throw err;
    }
});

module.exports = router;