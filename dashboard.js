const express = require('express');
const router = express.Router();
const fs = require('fs');

router.get('/', (req, res) => {
    files = fs.readdirSync('./websites/users');
    console.log(files);
    res.render('dashboard', files);
});

module.exports = router;