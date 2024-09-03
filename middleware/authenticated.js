const jwt = require("jsonwebtoken");
require("dotenv").config();
require("dotenv").config(); // Add this line to import the config object
const cookieParser = require("cookie-parser");
const verifySessionToken = async (req, res, next) => {
    await cookieParser(req, res); // Parse the cookies
    var cookie = req.cookies; // Access the parsed cookies
    console.log(cookie);
    if (cookie) { 
    if (cookie["x-access-token"]) {
        res.locals.loggedIn = true;
        next();
    } else {
        // Handle token verification error
        console.error("Token verification failed:");
        res.locals.loggedIn = false;
        next();
    }
}};

module.exports = verifySessionToken;