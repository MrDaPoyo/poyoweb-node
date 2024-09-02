const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.static('public'));
app.engine('art', require('express-art-template'));
app.set("views", "./views");
app.set('view engine', 'art');
app.set('view options', {
    debug: process.env.NODE_ENV !== 'production',
    ignore: ['Math', 'Date', 'JSON', 'encodeURIComponent'],
    minimize: false
});

const sqlite3 = require('sqlite3').verbose();

// open the database
let db = new sqlite3.Database('./poyoweb.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
});



// Routes
app.get('/', (req, res) => {
    res.render('index', data = { title: 'Home', url: process.env.URL });
});

app.get('/login', (req, res) => {
    res.render('login', data = { title: 'Login', token: Math.random().toString(36).substring(2), url: process.env.URL });
});








// 404 Error Handler
app.use((req, res, next) => {
    res.status(404).send('404 Not Found, Silly!');
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});