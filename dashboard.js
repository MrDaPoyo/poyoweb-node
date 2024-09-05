const express = require('express');
const router = express.Router();
const fs = require('fs');
const dirWalker = require('./snippets/dirWalker');

router.get('/', async (req, res) => {
    try {
        var results = {};
        results = await dirWalker("websites/users/" + req.user.username);
        res.render('dashboard', { files: results });
    } catch (err) {
        throw err;
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