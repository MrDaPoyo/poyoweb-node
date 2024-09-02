const express = require('express');
require('dotenv').config();
var startDB = require('./startdb');
db = startDB.db;
var authTokens = [];
var bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const authRouter = express.Router();

// Middleware to parse request body
authRouter.use(express.json());
authRouter.use(bodyParser.urlencoded({ extended: true }));

authRouter.post('/register', async (req, res) => {
    console.log(req.body);
    var username = req.body.username;
    var password = await bcrypt.hash(req.body.password, 10);
    console.log(password);
    var email = req.body.email;

    if (await email && password && await username) {
        db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, row) => {
            if (err) {
                console.error(err.message);
                res.status(500).send('Internal Server Error');
            } else if (row) {
                res.status(400).send('User or email already exists');
            } else {
                db.run('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, password, email], (err) => {
                    if (err) {
                        console.error(err.message);
                        res.status(500).send('Internal Server Error');
                    } else {
                        res.redirect('/onboard');
                    }
                });
            }
        });
        db.run('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, password, email], (err) => {
            if (err) {
                console.error(err.message);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/onboard');
            }
        });
    } else {
        res.status(400).send('Invalid request');
    }
});

// Logout route
authRouter.post('/logout', (req, res) => {
    // Implement your logout logic here
});

authRouter.get('/', (req, res) => {
    res.render('login', data = { title: 'Authentication Check', url: process.env.URL });
});

module.exports = authRouter;