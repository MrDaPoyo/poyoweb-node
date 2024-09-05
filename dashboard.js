const express = require('express');
const router = express.Router();
const fs = require('fs');
const dirWalker = require('./snippets/dirWalker');

router.get('/', async (req, res) => {
    try {
        const dirPath = "websites/users/" + req.user.username + (req.query.dir ? "/" + req.query.dir : "");
        const results = await dirWalker(dirPath);
        res.render('dashboard', { files: await results });
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
        res.redirect('/dashboard');
    } catch (err) {
        throw err;
    }
});

module.exports = router;