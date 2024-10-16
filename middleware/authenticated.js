const jwt = require("jsonwebtoken");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const verifySessionToken = async (req, res, next) => {
    await cookieParser(req, res); // Parse the cookies
    var cookie = req.cookies; // Access the parsed cookies
    if (cookie) {
        if (cookie["x-access-token"]) {
            await jwt.verify(cookie["x-access-token"], process.env.TOKEN_KEY, (err, decoded) => {
                res.locals.loggedIn = true;
                req.user = decoded;
                next();
            });
        } else {
            // Handle token verification error
            console.error("Token verification failed:");
            res.locals.loggedIn = false;
            next();
        }
    }
};

module.exports = verifySessionToken;
