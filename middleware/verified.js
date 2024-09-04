const startDB = require("../startdb");
var db = startDB.db;
const loggedIn = require("../verifyJwt");

const verified = async (req, res, next) => {
    const decoded = loggedIn(req, res, next);
    db.query(`SELECT * FROM users WHERE email = '${decoded.email}'`, (err, row) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Internal Server Error");
        }
        if (row[0].verified === 0) {
            return res.status(403).send("Email not verified, please check your inbox.");
        } else {
        next();
        }
    }
)};

const redirectIfNotVerified = async (req, res, next) => {
    const decoded = loggedIn(req, res, next);
    db.query(`SELECT * FROM users WHERE email = '${decoded.email}'`, (err, row) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Internal Server Error");
        }
        if (row[0].verified === 0) {
            return res.redirect('/');
        } else {
        next();
        }
    }
)}

module.exports = redirectIfNotVerified;