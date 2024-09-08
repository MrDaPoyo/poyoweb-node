const express = require('express');
const path = require('path');
const startDB = require('./startdb');

const router = express.Router();

router.use(async (req, res, next) => {
    const subdomain = req.headers.host.split('.')[0];

    if (!subdomain.includes('localhost') && subdomain !== 'www') {
        // var views = (await startDB.retrieveViews(subdomain)).views;
        // console.log("hit!: "+subdomain + ", views: " + await views);
        res.locals.isPoyoweb = false;
        const subdomainPath = path.join(__dirname, 'websites/users/', subdomain);
        express.static(subdomainPath)(req, res, next);
        router.use(sphp.express('public/'));
        startDB.addView(subdomain);
        try {
            res.sendFile(path.join(subdomainPath, 'index.html'));
        } catch (err) {
            try {
                res.sendFile(path.join(subdomainPath, '404.html'));
            } catch (err) {
                res.status(404).send('Website not found');
            }
        }
    } else {
        res.locals.isPoyoweb = true;
        next();
    }
});

module.exports = router;