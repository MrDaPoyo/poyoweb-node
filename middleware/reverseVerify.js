const loggedIn = require("../verifyJwt");

const verifyToken = async (req, res, next) => {
    const user = await loggedIn(req, res, next);
    if (user) {
        req.user = user;
        req.user.views = (await startDB.retrieveViews(user.subdomain)).views;
        res.redirect('/');
    } else {
        next();
    }
};

module.exports = verifyToken;