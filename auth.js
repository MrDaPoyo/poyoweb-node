const express = require('express');
require('dotenv').config();
var startDB = require('./startdb');
db = startDB.db;
var bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const reverseVerify = require('./middleware/reverseVerify');

const authRouter = express.Router();
authRouter.use(express.static('public'));

// Middleware to parse request body
authRouter.use(express.json());
authRouter.use(bodyParser.urlencoded({ extended: true }));

authRouter.post('/register', reverseVerify, async (req, res) => {
    console.log(req.body);
    var username = req.body.username;
    var password = await bcrypt.hash(req.body.password, 10);
    console.log(password);
    var email = req.body.email;

    if (await email && password && await username) {
        db.run('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, password, email], (err) => {
            if (err) {
                console.error(err.message);
                res.status(404).send('User Already Exists');
            } else {
                res.redirect('/dashboard', { cookie: 'specialCookie' });
            }
        });
        db.get('SELECT id FROM users WHERE username = ?;', [username], (err, row) => {
            db.run('INSERT INTO websites (userID, name) VALUES (?, ?)', [row.id, username], (err) => {
                if (err) {
                    console.error(err.message);
                }
                console.log('Website added', row);
            });
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
                        { user_id: user.id, username },
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



module.exports = authRouter;