const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = async (req, res, next) => {
    const token = req.cookies["x-access-token"];
    console.log("Token received:", token); // Log the received token

    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }

    try {
        const decoded = jwt.verify(token, config.TOKEN_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("Token verification failed:", err); // Log the error
        return res.status(401).send("Invalid Token");
    }
};

module.exports = verifyToken;