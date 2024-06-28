// const crypto = require('crypto');
// const userController = require('./userController');
// const sendEmail = require('../utils/sendEmail');

// const requestReset = async (email, res) => {
//   const user = await userController.findUserByEmail(email);
//   if (!user) {
//     res.writeHead(400, { 'Content-Type': 'application/json' });
//     res.end(JSON.stringify({ success: false, error: 'No user found with that email address.' }));
//     return;
//   }

//   const token = crypto.randomBytes(32).toString('hex');
//   const expires = Date.now() + 3600000; // 1 hour

//   // Save the token and its expiration time in the user's record or a separate table
//   await userController.savePasswordResetToken(email, token, expires);

//   const resetLink = `http://localhost:3000/reset_password_form?token=${token}`;
//   const subject = 'Password Reset Request';
//   const message = `To reset your password, please click the link below:\n\n${resetLink}`;

//   sendEmail(email, subject, message);

//   res.writeHead(200, { 'Content-Type': 'application/json' });
//   res.end(JSON.stringify({ success: true }));
// };

// const resetPassword = async (token, newPassword, res) => {
//   const user = await userController.findUserByResetToken(token);
//   if (!user || user.resetTokenExpires < Date.now()) {
//     res.writeHead(400, { 'Content-Type': 'application/json' });
//     res.end(JSON.stringify({ success: false, error: 'Invalid or expired token.' }));
//     return;
//   }

//   await userController.updatePassword(user.email, newPassword);
//   await userController.clearPasswordResetToken(user.email);

//   res.writeHead(200, { 'Content-Type': 'application/json' });
//   res.end(JSON.stringify({ success: true }));
// };

// module.exports = {
//   requestReset,
//   resetPassword
// };