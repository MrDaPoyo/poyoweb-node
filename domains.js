const express = require('express');
const path = require('path');
const startDB = require('./startdb');
const sphp = require('sphp');  // For PHP processing

const router = express.Router();

// Custom middleware for subdomain handling
router.use(async (req, res, next) => {
    const host = req.headers.host.split('.');
    const subdomain = host[0];

    // Exclude 'www' and 'localhost' from being treated as subdomains
    if (!subdomain.includes('localhost') && subdomain !== 'www') {
        res.locals.isPoyoweb = false;

        // Define the user's website directory based on subdomain
        const subdomainPath = path.join(__dirname, 'websites/users/', subdomain);

        // Serve static files (HTML, CSS, JS) from the user's directory
        const staticMiddleware = express.static(subdomainPath);

        // Attempt to serve static files
        staticMiddleware(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Server Error');
            }

            // Log the view count for the subdomain
            await startDB.addView(subdomain);

            // Try to serve index.html if no static file was served
            try {
                res.sendFile(path.join(subdomainPath, 'index.html'));
            } catch (error) {
                // If index.html doesn't exist, try to serve 404.html
                try {
                    res.sendFile(path.join(subdomainPath, '404.html'));
                } catch (error) {
                    res.status(404).send('Website not found');
                }
            }
        });
    } else {
        // If subdomain is 'www' or 'localhost', proceed to the next middleware
        res.locals.isPoyoweb = true;
        next();
    }
});

// PHP handling middleware (applied to the correct subdomain path)
router.use(sphp.express('websites/users'));  // Serve PHP files from the users' directories

module.exports = router;
