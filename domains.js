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
try {        // Subdomain logic
        res.locals.isPoyoweb = false;
        const subdomain = host.split('.')[0]; // Extract the subdomain from the host
        const subdomainPath = path.join(__dirname, 'websites/users/', subdomain); // Directory path for subdomain

        // Increment view count for the subdomain
        startDB.addView(subdomain);

        // Normalize the requested URL path
        let requestedFilePath = path.join(subdomainPath, requestedPath);
        requestedFilePath = path.normalize(requestedFilePath); // Prevent directory traversal attacks

        // If the requested path is a folder, look for an index.html
        if (fs.existsSync(requestedFilePath) && fs.lstatSync(requestedFilePath).isDirectory()) {
            const folderIndexFile = path.join(requestedFilePath, 'index.html');
            if (fs.existsSync(folderIndexFile) && fs.lstatSync(folderIndexFile).isFile()) {
                return res.sendFile(folderIndexFile);
            }
        }

        // Try serving the requested file directly if it exists
        if (fs.existsSync(requestedFilePath) && fs.lstatSync(requestedFilePath).isFile()) {
            return res.sendFile(requestedFilePath);
        }

        // Try serving the requested file with .html appended
        const requestedFileWithHtml = requestedFilePath + '.html';
        if (fs.existsSync(requestedFileWithHtml) && fs.lstatSync(requestedFileWithHtml).isFile()) {
            return res.sendFile(requestedFileWithHtml);
        }

        // Serve index.html for the subdomain root if no file was requested
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
    } catch (err) {
    	return res.status(404).send("404");
    }}
});

module.exports = router;
