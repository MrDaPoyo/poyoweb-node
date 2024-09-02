const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('./api/models/user');


router.post('/register', async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(400).send('User already exists. Please sign in');
    } else {
        try {
            const salt = await bcrypt.genSalt(10);
            const password = await bcrypt.hash(req.body.password, salt);
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                password: password
            });
            await user.save();
            return res.status(201).json(user);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }
    }
});

router.post('/login', async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).send('Invalid email or password');
    }
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
        return res.status(400).send('Invalid email or password');
    }
    return res.status(200).json({ message: 'Login successful' });
});

router.get('login', (req, res) => {
    res.render('login', data = { title: 'Login' });
});

module.exports = router;