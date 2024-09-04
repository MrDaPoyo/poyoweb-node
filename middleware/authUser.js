const loggedIn = require("../verifyJwt");

const userData = async (req, res, next) => {
    const user = await loggedIn(req, res, next);
    if (user) {
        req.user = user;
        next();
    } else {
        next();
    }
};

module.exports = userData;