var startDB = require("../startdb");
const loggedIn = require("../verifyJwt");

const redirectIfNotVerified = async (req, res, next) => {
    try {
        let user = await loggedIn(req, res, next);

        if (user["email"]) {
            user = await startDB.findUserByEmail(user["email"]);

            if (user["verified"] == 1) {
                return next();
            } else {
                res.clearCookie('token');  // Remove the token
                return res.redirect('/');
            }
        } else {
            res.clearCookie('token');  // Remove the token
            return res.redirect('/');
        }
    } catch (error) {
        res.clearCookie('token');  // Remove the token
        return res.redirect('/');
    }
}

module.exports = redirectIfNotVerified;
