const express = require('express');
const fs = require('fs');
var router = express.Router();

router.get('/:filename', async function(req, res, next) {
    fs.readFile(`websites/users/${req.user.name}/${req.params.filename}`, 'utf8', function(err, data) {
        if (err) {
            console.log(err);
            res.send('An error occurred');
        } else {
            res.send(data);
        }
    });
});

module.exports = router;