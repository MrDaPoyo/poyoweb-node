const express = require('express');
const path = require('path');

const router = express.Router();

router.use((req, res, next) => {
    const subdomain = req.headers.host.split('.')[0];
    console.log(subdomain);
    
    if (!subdomain.includes('localhost') && subdomain !== 'www') {
        const subdomainPath = path.join(__dirname , 'websites/users/', subdomain);
        express.static(subdomainPath)(req, res, next);
        res.sendFile(path.join(subdomainPath, 'index.html'));
        
    } else {
        next();
    }
});

module.exports = router;