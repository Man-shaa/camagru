// Requirements
const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const requestHandler = (req, res) => {
	const url = req.url;

	if (url.match(/\.css$/))
	{
		fs.readFile(path.join(__dirname, "../public/css", url), (err, data) => {
			if (err) {
				res.writeHead(404, { "Content-Type": "text/plain" });
				res.end("Not Found");
				return;
			}
			res.writeHead(200, { "Content-Type": "text/css" });
			res.end(data);
		});
	}
	else if (url.match(/\.js$/))
	{
		fs.readFile(path.join(__dirname, "../public/scripts", url), (err, data) => {
			if (err) {
				res.writeHead(404, { "Content-Type": "text/plain" });
				res.end("Not Found");
				return;
			}
			res.writeHead(200, { "Content-Type": "text/javascript" });
			res.end(data);
		});
	}
	else if (url.startsWith('/send_email') && req.method === 'POST')
	{
		const userEmail = url.split('/send_email/')[1];
		console.log("user_email", userEmail);
		let body = '';
		req.on('data', chunk => {
			body += chunk.toString();
		});
		req.on('end', () => {
			const data = JSON.parse(body);
			console.log(data);

			// send mail using nodemailer
			const transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
					user: 'manuel.sharifi0@gmail.com',
					pass: 'kzny kvvi atwx ctwx'
				}
			});

			const mailOptions = {
				from: 'manuel.sharifi0@gmail.com',
				to: userEmail,
				subject: data.subject,
				text: data.message
			};

			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					console.log(error);
					res.writeHead(500, { "Content-Type": "text/plain" });
					res.end("Error sending email");
				}
				else {
					console.log('Email sent: ' + info.response);
					res.writeHead(200, { "Content-Type": "text/plain" });
					res.end("Email sent successfully");
				}
			});
		});
	}
	else
	{
		openFile(url, res);
	}
};

const openFile = (url, res, redir) => {
	fs.readFile(path.join(__dirname, '../public/pages' + url + '.html'), (err, data) => {
		if (err) {
			openFile('/wip', res);
			return;
		}
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end(data);
	});
}

const server = http.createServer(requestHandler);
const PORT = 3000;

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

