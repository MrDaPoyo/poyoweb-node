const jwt = require("jsonwebtoken");
require("dotenv").config();

const config = process.env;

const userData = async (req, res, next) => {
    const token = req.cookies["x-access-token"];
    console.log("Token received:", token); // Log the received token

    if (!token) {
        next();
    }

    try {
        const decoded = jwt.verify(token, config.TOKEN_KEY);
        req.user = decoded;
        console.log("User data:", req.user); // Log the user data
        next();
    } catch (err) {
        next();
    }
};

module.exports = userData;