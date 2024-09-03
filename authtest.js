const express = require('express');
const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRouter = express.Router();
app.use('/auth', authRouter);

const port = 3000; // Choose a port number that is not already in use

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
