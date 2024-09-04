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

module.exports = router;