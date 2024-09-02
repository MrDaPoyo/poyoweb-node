const express = require('express');
const axios = require('axios')

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

// Routes
app.get('/', (req, res) => {
    res.render('index', data= {title: 'Home'});
});

// 404 Error Handler
app.use((req, res, next) => {
    res.status(404).send('404 Not Found');
});



// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});