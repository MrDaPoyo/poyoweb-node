const jwt = require("jsonwebtoken");
require("dotenv").config();
const cookieParser = require('cookie-parser');

function loggedIn(req, res, next) {
    cookieParser(req, res);
    const token = req.cookies["x-access-token"];
    console.log("Token received:", token); // Log the received token
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        if (decoded) {
            return decoded;
        } else {
            return false;
        }
    } catch (err) {
        return false;
    } 
};

module.exports = loggedIn;