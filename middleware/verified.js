const startDB = require("../startdb");
var db = startDB.db;
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const verified = async (req, res, next) => {
    cookieParser(req, res);
    const token = req.cookies["x-access-token"];
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
    db.query(`SELECT * FROM users WHERE email = '${req.user.email}'`, (err, row) => {
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
    cookieParser(req, res);
    const token = await req.cookies["x-access-token"];
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
    db.query(`SELECT * FROM users WHERE email = '${req.user.email}'`, (err, row) => {
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