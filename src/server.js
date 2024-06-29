// Requirements
const http = require('http');
const routes = require('./routes');
const fs = require('fs');
const path = require('path');

const requestHandler = (req, res) => {
	const url = req.url;

	if (url === '/')
	{
		openFile(url, res);
	}
	else if (url === '/signup' && req.method === 'GET')
	{
		openFile(url, res);
	}
	else if (url === '/signin' && req.method === 'GET')
	{
		openFile(url, res);
	}
	else if (url === '/homepage' && req.method === 'GET')
	{
		openFile(url, res);
	}
	else if (url === '/reset_password' && req.method === 'GET')
	{
		openFile(url, res)
	}
	else if (url === '/reset_password_request' && req.method === 'GET')
	{
		openFile(url, res);
	}
	else if (url === '/verify_email' && req.method === 'GET')
	{
		openFile(url, res);
	}
	else if (url.match(/\.css$/))
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
			res.writeHead(200, { "Content-Type": "text/js" });
			res.end(data);
		});
	}
	else if (url === '/homepage' && req.method === 'GET')
	{
		openFile(url, res);
	}
	else
	{
		routes.router(req, res);
	}
};

const openFile = (url, res, redir) => {
	fs.readFile(path.join(__dirname, '../public/pages' + url + '.html'), (err, data) => {
		if (err) {
			res.writeHead(500, { 'Content-Type': 'text/plain' });
			res.end('Internal Server Error');
			return;
		}
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end(data);
	});
}

const server = http.createServer(requestHandler);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
