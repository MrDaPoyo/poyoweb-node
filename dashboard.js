const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const dirWalker = require('./snippets/dirWalker');
const bodyParser = require('body-parser');
const checkCreatableFile = require('./snippets/verifyFile');

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

            res.render('dashboard', { files: await results, past: pastDir, cleanPath, dashboard: (dirPath == "websites/users/" + await req.user.username || cleanPath == "/") });
        }
    } catch (err) {
        res.send("Directory Not Found. Good try, Hacker :3");
    }
});

router.get('/remove', (req, res) => {
    try {
        fs.unlinkSync("websites/users/" + req.user.username + "/" + req.query.dir);
        if (req.query.dir.includes(".")) {
            res.redirect(`/dashboard`);
        }
        res.redirect(`/dashboard?dir=${path.dirname(req.query.dir)}`);
    } catch (err) {
        fs.rmdirSync("websites/users/" + req.user.username + "/" + req.query.dir, { recursive: true });
    }
});

router.post('/create', async (req, res) => {
    try {
        var dirname = "websites/users/" + await req.user.username + "/" + await req.body.cleanPath + "/" + await req.body.dir;
        var valid = checkCreatableFile(dirname);
        if (!valid) {
            res.status(404).send("FileType not allowed.");
        } else if (dirname.includes("..")) {
            res.status(404).send("HA! Good try, Hacker :3");
        } else if (req.body.dir.length > 30) {
            res.status(404).send("FileName too long.");
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

router.post('/editName', async (req, res) => {
    try {
        var oldPath = "websites/users/" + await req.user.username + "/" + await req.body.oldPath;
        var newPath = "websites/users/" + await req.user.username + "/" + await req.body.newPath;
        if (oldPath.includes("..") || newPath.includes("..")) {
            res.status(404).send("HA! Good try, Hacker :3");
        } else {
            fs.renameSync(oldPath, newPath);
            res.redirect('/dashboard/?dir=' + await req.body.cleanPath);
        }
    } catch (err) {
        console.log(err);
        res.send("Error renaming file/directory.");
    }
});

module.exports = router;