const express = require('express');
require('dotenv').config();
var startDB = require('./startdb');
db = startDB.db;
var authTokens = [];
var bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const authRouter = express.Router();
authRouter.use(express.static('public'));
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

authRouter.post("/login", async (req, res) => {
    try {
        // Get user input
        const { username, password } = req.body;

        // Validate user input
        if (!(username && password)) {
            return res.status(400).send("All input is required");
        }

        // Validate if user exists in our database
        db.get('SELECT * FROM users WHERE username = ?;', [username], async (err, row) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send('Internal Server Error');
            }

            if (row) {
                console.log(row);
                const user = {
                    id: row.id,
                    email: row.email,
                    password: row.password,
                };
                // Compare passwords
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (isPasswordValid) {
                    // Create token
                    const token = jwt.sign(
                        { user_id: user.id, username },
                        process.env.TOKEN_KEY,
                        {
                            expiresIn: "5h",
                        }
                    );

                    // Save token and respond with user info
                    user.token = token;
                    return res.status(200).json(user);
                } else {
                    return res.status(400).send("Invalid Credentials");
                }
            } else {
                return res.status(400).send("Invalid Credentials");
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});


authRouter.get('/', (req, res) => {
    res.render('login', data = { title: 'Authentication Check', url: process.env.URL });
});

module.exports = authRouter;