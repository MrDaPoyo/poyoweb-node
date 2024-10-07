const express = require('express');
const path = require('path');
const fs = require('fs'); // Import file system module to check file existence
const startDB = require('./startdb');

const router = express.Router();

router.use(async (req, res, next) => {
    const host = req.headers.host;

    // Define the expected domain structure
    const expectedDomain = 'poyoweb.poyo.study';
    const requestedPath = req.url;

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

        // Normalize the requested URL path
        const normalizedRequestedPath = path.join(subdomainPath, requestedPath);
        const requestedFile = path.normalize(normalizedRequestedPath);

        // Try serving the requested file directly
        if (fs.existsSync(requestedFile) && fs.lstatSync(requestedFile).isFile()) {
            return res.sendFile(requestedFile);
        }

        // Try serving the requested file with .html appended
        const requestedFileWithHtml = requestedFile + '.html';
        if (fs.existsSync(requestedFileWithHtml) && fs.lstatSync(requestedFileWithHtml).isFile()) {
            return res.sendFile(requestedFileWithHtml);
        }

        // Serve index.html for the subdomain root
        const indexPath = path.join(subdomainPath, 'index.html');
        if (requestedPath === '/' || requestedPath === '') {
            if (fs.existsSync(indexPath) && fs.lstatSync(indexPath).isFile()) {
                return res.sendFile(indexPath);
            }
        }

        // Serve 404.html or fallback 404 message
        const errorPagePath = path.join(subdomainPath, '404.html');
        if (fs.existsSync(errorPagePath) && fs.lstatSync(errorPagePath).isFile()) {
            return res.sendFile(errorPagePath);
        } else {
            // If no 404 page exists, send a basic 404 response
            return res.status(404).send('File Not Found - poyoweb.poyo.study');
        }
    }
});

module.exports = router;
