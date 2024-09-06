const express = require('express');
const path = require('path');
const startDB = require('./startdb');

const router = express.Router();

router.use(async (req, res, next) => {
    const subdomain = req.headers.host.split('.')[0];
    console.log("hit!: "+subdomain + ", views: " + (await startDB.retrieveViews(subdomain)).views);

    if (!subdomain.includes('localhost') && subdomain !== 'www') {
        const subdomainPath = path.join(__dirname, 'websites/users/', subdomain);
        express.static(subdomainPath)(req, res, next);
        startDB.addView(subdomain);
        res.sendFile(path.join(subdomainPath, 'index.html'));
    } else {
        next();
    }
});

module.exports = router;