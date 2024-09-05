const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const dirWalker = require('./snippets/dirWalker');
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));

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

router.post('/create', async (req, res) => {
    try {
        var dirname = "websites/users/" + await req.user.username + "/" + await req.body.dir;
        if (dirname.includes("..")) {
            res.status(404).send("HA! Good try, Hacker :3");
        } else {
            if (!dirname.includes(".")) {
                fs.mkdirSync(dirname, { recursive: true });
                res.redirect('/dashboard/?dir=' + await req.body.cleanPath);
            } else {
                fs.writeFileSync(dirname, '');
                res.redirect('/dashboard/?dir=' + await req.body.cleanPath);
            };
        }
    } catch (err) {
        console.log(err);
        res.send("Error creating file/directory.");
    }
});

module.exports = router;