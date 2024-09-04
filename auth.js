const express = require('express');
require('dotenv').config();
var startDB = require('./startdb');
db = startDB.db;
var bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const reverseVerify = require('./middleware/reverseVerify');
const fs = require('fs');
const verifySessionToken = require('./middleware/authenticated');
const tokenSender = require('./tokenSender');

const authRouter = express.Router();
authRouter.use(express.static('public'));

// Middleware to parse request body
authRouter.use(express.json());
authRouter.use(bodyParser.urlencoded({ extended: true }));
authRouter.use(verifySessionToken);

authRouter.post('/register', async (req, res) => {
    console.log(req.body);
    var username = req.body.username;
    var password = await bcrypt.hash(req.body.password, 10);
    console.log(password);
    var email = req.body.email;

    if (await email && password && await username) {
        db.run('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, password, email], (err, row) => {
            const token = jwt.sign(
                { username: username, email: email },
                process.env.TOKEN_KEY,
                { expiresIn: "24h" }
            );
            res.cookie('x-access-token', token);
            if (err) {
                console.error(err.message);
                res.status(404).send('User Already Exists');
            } else {
                res.cookie('x-access-token', token);
                res.redirect('/');
                db.get('SELECT id FROM users WHERE username = ?;', [username], (err, row) => {
                    if (err) {
                        console.error(err.message);
                    } else {
                        db.run('INSERT INTO websites (userID, name) VALUES (?, ?)', [row.id, username], (err) => {
                            if (err) {
                                console.error(err.message);
                                res.send('User Already Exists');
                            } else {
                                fs.mkdir('./websites/users/' + username, { recursive: true }, (err) => {
                                    if (err) {
                                        console.error(err.message);
                                    } else {
                                        fs.copyFile('./websites/src/index.html', './websites/users/' + username + '/index.html', (err) => {
                                            if (err) {
                                                console.error(err.message);
                                            }
                                            tokenSender(token, email);
                                            console.log('User Created');
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });

    }
});

authRouter.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!(username && password)) {
            return res.status(400).send("All input is required");
        }

        db.get('SELECT * FROM users WHERE username = ?;', [username], async (err, row) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send('Internal Server Error');
            }

            if (row) {
                const user = {
                    id: row.id,
                    email: row.email,
                    password: row.password,
                };

                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (isPasswordValid) {
                    const token = jwt.sign(
                        { username, email: user.email },
                        process.env.TOKEN_KEY,
                        { expiresIn: "5h" }
                    );

                    user.token = token;
                    res.cookie('x-access-token', token);
                    res.status(200).redirect('/');
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


authRouter.get('/', reverseVerify, (req, res) => {
    res.render('login', data = { title: 'Authentication Check', url: process.env.URL });
});

authRouter.get('/logout', (req, res) => {
    res.clearCookie('x-access-token');
    res.redirect('/');
});

authRouter.get('/verify/:token', (req, res) => {
    const { token } = req.params;

    // Verifying the JWT token 
    jwt.verify(token, process.env.TOKEN_KEY, function (err, decoded) {
        if (err) {
            console.log(err);
            res.send("Email verification failed, possibly the link is invalid or expired");
        }
        else {
            db.run('UPDATE users SET verified = true  WHERE email = ?', [decoded.email], (err) => {
                if (err) {
                    console.error(err.message);
                    res.send("Email verification failed, possibly the link is invalid or expired");
                } else {
                    res.cookie('x-access-token', token);
                    res.redirect('/verified', 200, { title: 'Email Verified', url: process.env.URL });
                }
            });

        }
    });
});


module.exports = authRouter;