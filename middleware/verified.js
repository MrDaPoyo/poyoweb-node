var startDB = require("../startdb");
const loggedIn = require("../verifyJwt");

const redirectIfNotVerified = async (req, res, next) => {
    let user = await loggedIn(req, res, next);
    if (user["email"]) {
        user = await startDB.findUserByEmail(await user["email"]);
        if (user["verified"] === 1) {
            next();
        } else {
            res.redirect('/');
        }
    } else {
        res.redirect('/');
    }
}

module.exports = redirectIfNotVerified;