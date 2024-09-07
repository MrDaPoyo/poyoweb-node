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
        text: `Haii! :3\nYou have recently registered on the PoyoWeb!\nPlease follow the given link to verify your email, and start buildig a better web. :D \n${process.env.URL}/auth/verify/${token}\n Thanks!\n--The PoyoWeb Team`
    };

    transporter.sendMail(mailConfigurations, function (error) {
        if (error) throw Error(error);
        console.log('Email Sent Successfully');
    });
}

function sendRecoveryEmail(token, email) {

    const mailConfigurations = {

        // It should be a string of sender/server email
        from: 'poyowebbot@gmail.com',
        to: email,
        subject: 'PoyoWeb - Password Recovery',
        text: `Haii! :3\nYou have recently requested a password recovery on the PoyoWeb!\nPlease follow the given link to recover your password. :D \n${process.env.URL}/auth/recover/${token}\n Thanks!\n--The PoyoWeb Team`
    };

    transporter.sendMail(mailConfigurations, function (error) {
        if (error) throw Error(error);
        return console.log('Email Sent Successfully');
    });
}
module.exports = {
    sendVerificationEmail,
    sendRecoveryEmail
};