const express = require('express');
require('dotenv').config();
var startDB = require('./startdb');
db = startDB.db;
var authTokens = [];
var bcrypt = require('bcrypt');

const authRouter = express.Router();

// Middleware to parse request body
authRouter.use(express.json());

async function saveUser(email, username, password) {
    password = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password, email) VALUES (?, ?)', [username, password, email], (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).send('User registered successfully');
        }
    });
}

// Register route
authRouter.post('/register', async (req, res) => {
    var username = await req.body.username;
    var email = await req.body.email;
    var password = await req.body.password;
    
    try {
        saveUser(email, username, password);
        res.redirect('/')
    }
    catch (e) {
        console.log(e);
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