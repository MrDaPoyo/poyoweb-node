const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        pass: process.env.EMAIL_PASSWORD,
        user: process.env.EMAIL_USERNAME,
    }
});

function sendVerificationEmail(token, email) {

    const mailConfigurations = {

        // It should be a string of sender/server email
        from: 'poyowebbot@gmail.com',

        to: email,

        // Subject of Email
        subject: 'PoyoWeb - Email Verification',

        // This would be the text of email body
        text: `Hi! You have recently registered on the PoyoWeb and entered your email. Please follow the given link to verify your email, and build a better web. ${process.env.URL}/auth/verify/${token} \n Thanks!\n--The PoyoWeb Team`
    };

    transporter.sendMail(mailConfigurations, function (error, info) {
        if (error) throw Error(error);
        console.log('Email Sent Successfully');
        console.log(info);
    });
}

module.exports = sendVerificationEmail;