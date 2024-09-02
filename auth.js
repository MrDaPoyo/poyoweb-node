const express = require('express');
require('dotenv').config();
var db = require('./startdb');
var authTokens = [];
var bcrypt = require('bcrypt');

const authRouter = express.Router();

// Login route
authRouter.post('/login', (req, res) => {
    // Implement your login logic here
});

// Register route
authRouter.post('/register', (req, res) => {
    username = req.body.username;
    password = bcrypt.hash(req.body.password);
    token = req.body.token;

    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).send('User registered successfully');
        }
    });
    res.redirect('/', cookie = { token: token });
});

// Logout route
authRouter.post('/logout', (req, res) => {
    // Implement your logout logic here
});

authRouter.get('/', (req, res) => {
    res.render('login', data = { title: 'Authentication Check', url: process.env.URL });
});

module.exports = authRouter;