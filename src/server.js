// Requirements
const http = require('http');
const routes = require('./routes');
const fs = require('fs');
const path = require('path');



const requestHandler = (req, res) => {
	const url = req.url;

	if (url === '/')
	{
		fs.readFile(path.join(__dirname, '../public/pages/index.html'), (err, data) => {
			if (err) {
				res.writeHead(500, { 'Content-Type': 'text/plain' });
				res.end('Internal Server Error');
				return;
			}
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(data);
		});
	}
	else if (url === '/signup' && req.method === 'GET')
	{
		fs.readFile(path.join(__dirname, '../public/pages/signup.html'), (err, data) => {
			if (err) {
				res.writeHead(500, { 'Content-Type': 'text/plain' });
				res.end('Internal Server Error');
				return;
			}
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(data);
		});
	}
	else if (url === '/signin' && req.method === 'GET')
	{
		fs.readFile(path.join(__dirname, '../public/pages/signin.html'), (err, data) => {
			if (err) {
				res.writeHead(500, { 'Content-Type': 'text/plain' });
				res.end('Internal Server Error');
				return;
			}
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(data);
		});
	}
	else if (url.match(/\.css$/))
	{
		fs.readFile(path.join(__dirname, '../public', url), (err, data) => {
			if (err) {
				res.writeHead(404, { 'Content-Type': 'text/plain' });
				res.end('Not Found');
				return;
			}
			res.writeHead(200, { 'Content-Type': 'text/css' });
			res.end(data);
		});
	}
	else
	{
		routes.router(req, res);
	}
};

const server = http.createServer(requestHandler);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
