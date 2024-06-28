const nodemailer = require('nodemailer');

// Set up the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password'
  }
});

// Function to send mail
const sendMail = (mailOptions, callback) => {
  transporter.sendMail(mailOptions, callback);
};

module.exports = sendMail;
