const jwt = require("jsonwebtoken");
require("dotenv").config();
require("dotenv").config(); // Add this line to import the config object
const cookieParser = require("cookie-parser");
const verifySessionToken = async (req, res, next) => {
    await cookieParser(req, res); // Parse the cookies
    var cookie = req.cookies; // Access the parsed cookies
    try {
        const token = cookie.sessionToken; // Assuming the token is stored in the 'sessionToken' cookie
        // Perform any additional verification or checks here if needed
    } catch (error) {
        // Handle token verification error
        console.error("Token verification failed:", error);
        res.locals.loggedIn = false;
        next();
    }
    res.locals.loggedIn = true;
    next();
};

module.exports = verifySessionToken;