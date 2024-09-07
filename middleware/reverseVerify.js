const loggedIn = require("../verifyJwt");

const verifyToken = async (req, res, next) => {
    if (req.isPoyoweb == true) {
        const user = await loggedIn(req, res, next);
        if (user) {
            req.user = user;
            res.redirect('/');
        } else {
            next();
        }
    }
    else {
        next();
    }
};

module.exports = verifyToken;