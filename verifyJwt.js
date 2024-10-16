const jwt = require("jsonwebtoken");
require("dotenv").config();
const cookieParser = require('cookie-parser');

async function loggedIn(req, res, next) {
    cookieParser(req, res);
    const token = req.cookies["x-access-token"];
    try {
        const decoded = await jwt.verify(token, process.env.TOKEN_KEY);
        if (decoded) {
            return await decoded;
        } else {
            return false;
        }
    } catch (err) {
        return false;
    } 
};

module.exports = loggedIn;
