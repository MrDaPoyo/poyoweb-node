const express = require('express');
const path = require('path');
const startDB = require('./startdb');

const router = express.Router();

router.use(async (req, res, next) => {
    const host = req.headers.host;

    // Define the expected domain structure
    const expectedDomain = 'poyoweb.poyo.study';
    
    // Check if the host contains a subdomain (i.e., is longer than the expected domain)
    if (host.endsWith(expectedDomain) && host.length > expectedDomain.length) {
        res.locals.isPoyoweb = false;
        const subdomain = host.split('.')[0]; // Extract the subdomain from the host
        const subdomainPath = path.join(__dirname, 'websites/users/', subdomain);

        // Increment view count for the subdomain
        startDB.addView(subdomain);

        try {
            // Serve the index.html file
            res.sendFile(path.join(subdomainPath, 'index.html'));
        } catch (err) {
            try {
                // If index.html is not found, serve the 404.html file
                res.sendFile(path.join(subdomainPath, '404.html'));
            } catch (err) {
                // If neither file is found, respond with a 404 status
                res.status(404).send('Website not found');
            }
        }
    } else {
        // For requests to the main domain or www, continue to the next middleware
        res.locals.isPoyoweb = true;
        next();
    }
});

module.exports = router;
