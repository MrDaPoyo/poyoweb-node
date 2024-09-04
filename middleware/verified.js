var startDB = require("../startdb");
var db = startDB.db;
const loggedIn = require("../verifyJwt");

const verified = async (req, res, next) => {
    const user = await loggedIn(req, res, next);
        if (user.verified === 0) {
            return res.status(403).send("Email not verified, please check your inbox.");
        } else {
            next();
        }
};

const redirectIfNotVerified = async (req, res, next) => {
    let user = await loggedIn(req, res, next);
    user = await startDB.findUserByEmail(await user["email"]);
    if (verified == 0) {
        return res.redirect("/");
    } else {
        next();
    }
}

module.exports = redirectIfNotVerified;