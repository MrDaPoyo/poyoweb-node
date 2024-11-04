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
const user = require('./users');

const authRouter = express.Router();
authRouter.use(express.static('public'));

// Middleware to parse request body
authRouter.use(express.json());
authRouter.use(bodyParser.urlencoded({ extended: true }));
authRouter.use(verifySessionToken);

authRouter.post('/register', async (req, res, next) => {
    console.log("New user");
    var username = (req.body.username).toLowerCase();
    var password = await bcrypt.hash(req.body.password, 10);
    var email = req.body.email;
    var valid = user.checkUsername(await username, req, res);
    if (valid == true && username.length > 0 && password.length > 0 && email.length > 0 && email.includes('@') && email.includes('.')) {
        if (await email && password && await username) {
            db.run('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, password, email], (err, row) => {
                const token = jwt.sign(
                    { username: username, email: email, verified: 0 },
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
                            db.run('INSERT INTO websites (userID, name, domain) VALUES (?, ?, ?)', [row.id, username, (username+"."+process.env.SUFFIX)], (err) => {
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
                                                fs.copyFile('./websites/src/poyoweb-button.png', './websites/users/' + username + '/poyoweb-button.png', (err) => {
                                                	tokenSender.sendVerificationEmail(token, email);
                                                	console.log('User Created');
                                                	if (err) {
                                                		console.log(err.message);
                                                	}	
                                                })
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
    } else {
        res.status(404).send(valid);
    }
});

authRouter.post("/login", async (req, res) => {
    try {
        var { username, password } = req.body;
		username = username.toLowerCase();
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
                    verified: row.verified
                };

                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (isPasswordValid) {
                    const token = jwt.sign(
                        { username, email: user.email, verified: user.verified },
                        process.env.TOKEN_KEY,
                        { expiresIn: "30d" }
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
    res.render('login', data = { title: 'Authentication Check', url: process.env.URL, site_key: process.env.CLOUDFLARE_SITE_KEY });
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
                    var newToken = jwt.sign(
                        { username: decoded.username, email: decoded.email, verified: 1 },
                        process.env.TOKEN_KEY,
                        { expiresIn: "5h" }
                    );
                    res.cookie('x-access-token', newToken);
                    res.redirect('/verified', 200, { title: 'Email Verified', url: process.env.URL });
                }
            });

        }
    });
});

authRouter.get('/recover/', (req, res) => {
    res.render('recover', { title: 'Recover Password', url: process.env.URL });
});

authRouter.post('/recover/', (req, res) => {
    var email = req.body.email;
    db.get('SELECT * FROM users WHERE email = ?;', [email], (err, row) => {
        if (err) {
            console.error(err.message);
            res.send('User Not Found');
        }
        if (row) {
            const token = jwt.sign(
                { email: email },
                process.env.TOKEN_KEY,
                { expiresIn: "24h" }
            );
            tokenSender.sendRecoveryEmail(token, email);
            res.send('Password recovery email sent');
        } else {
            res.send('Email not found');
        }
    });
});

authRouter.get('/recover/:token', (req, res) => {
    var token = req.params.token;
    jwt.verify(token, process.env.TOKEN_KEY, function (err, decoded) {
        if (err) {
            console.log(err);
            res.send("Password recovery failed, possibly the link is invalid or expired");
        }
        else {
            res.render('reset_password_form', { title: 'Reset Password', url: process.env.URL, token: token, email: decoded.email, name: decoded.username });
        }
    });
});

authRouter.post('/recover/:token', async (req, res) => {
    try {
        const token = req.params.token;
        const password = await bcrypt.hash(req.body.password, 10);

        // Verify the token
        jwt.verify(token, process.env.TOKEN_KEY, async function (err, decoded) {
            if (err) {
                console.log(err);
                return res.send("Password recovery failed, possibly the link is invalid or expired");
            }

            // Perform the DB update as a promise
            try {
                await new Promise((resolve, reject) => {
                    db.run('UPDATE users SET password = ? WHERE email = ?', [password, decoded.email], function (err) {
                        if (err) return reject(err);
                        resolve();
                    });
                });

                res.send('Password Recovery Successful, you can now login with your new password');
            } catch (dbErr) {
                console.error(dbErr.message);
                res.send('Password Recovery Failed');
            }
        });
    } catch (err) {
        console.error("Error in processing the request:", err);
        res.send('An error occurred while processing your request.');
    }
});

module.exports = authRouter;
