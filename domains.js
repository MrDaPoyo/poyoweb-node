const express = require('express');
const path = require('path');
const fs = require('fs'); // Import file system module to check file existence
const startDB = require('./startdb');

const router = express.Router();

router.use(async (req, res, next) => {
    const host = req.headers.host;

    // Define the expected domain structure
    const expectedDomain = 'poyoweb.poyo.study';
    
    // Check if the request is for the main domain
    if (host === expectedDomain) {
        // For requests to the main domain, continue to the next middleware
        res.locals.isPoyoweb = true;
        return next();
    } else {
        // Subdomain logic
        res.locals.isPoyoweb = false;
        const subdomain = host.split('.')[0]; // Extract the subdomain from the host
        const subdomainPath = path.join(__dirname, 'websites/users/', subdomain); // Directory path for subdomain

        // Increment view count for the subdomain
        startDB.addView(subdomain);

        const indexPath = path.join(subdomainPath, 'index.html');
        const errorPagePath = path.join(subdomainPath, '404.html');
        const requestedPath = req.url;const requestedPath = req.url;

// Check if the requested path exists
if (fs.existsSync(requestedPath)) {
    return res.sendFile(requestedPath); // Serve the requested file if it exists
} else if (requestedPath === '/' || requestedPath === '') {
    return res.sendFile(indexPath); // Serve index.html only if the requested path is / or blank
} else if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath); // Serve index.html if it exists, even if the requested path is not / or blank
} else if (fs.existsSync(errorPagePath)) {
    return res.sendFile(errorPagePath); // Serve 404.html if index.html doesn't exist
} else {
    // If none of the files are found, respond with a 404 status
    return res.status(404).send('Website/Index.html not found - poyoweb.poyo.study');
}
    }
});

module.exports = router;
