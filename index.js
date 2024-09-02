const express = require('express');
const db = require('./startdb');
const authRouter = require('./auth');
const authToken = require('./middleware/auth');
require('dotenv').config();

db.setupDB();

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

// Retrieve all users from the table
app.get('/users', authToken, (req, res) => {
    db.all('SELECT * FROM users', (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(rows);
        }
    });
});

// Routes
app.get('/', (req, res) => {
    res.render('index', data = { title: 'Home', url: process.env.URL });
});

app.use('/auth', authRouter);




// 404 Error Handler
app.use((req, res, next) => {
    res.status(404).send('404 Not Found, Silly!');
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});