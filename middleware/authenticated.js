const jwt = require("jsonwebtoken");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const verifySessionToken = async (req, res, next) => {
    await cookieParser(req, res); // Parse the cookies
    var cookie = req.cookies; // Access the parsed cookies
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