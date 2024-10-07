const nodemailer = require("nodemailer");

async function mailer(email) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "manuel.sharifi@gmail.com",
      pass: "myat wjqx gxbu fhys",
    },
  });
  const mailOptions = {
    from: "manuel.sharifi@gmail.com",
    to: email,
    subject: "New comment / like",
    html: `<p>Hello,</p>
    <p>A user has commented or liked your picture</p>`
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log("error", err);
  }
}

export { mailer }