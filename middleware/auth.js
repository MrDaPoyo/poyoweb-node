const loggedIn = require("../verifyJwt");

const verifyToken = async (req, res, next) => {
    const user = await loggedIn(req, res, next);
    if (user) {
        req.user = user;
        next();
    } else {
        res.status(403).send("You must be logged in to access this page");
    }
};

module.exports = verifyToken;