const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = async (req, res, next) => {
    const token = req.cookies["x-access-token"];
    console.log("Token received:", token); // Log the received token

    if (!token) {
        next();
    }
    else {
        res.redirect('/'); // Redirect to the home page
    }
};

module.exports = verifyToken;