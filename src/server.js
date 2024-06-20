// Requirements
const firebase = require('firebase/app');
require('firebase/database');
require('firebase/auth');
const admin = require("firebase-admin");
var serviceAccount = require("../config/camagru-private-key.json");
const http = require('http');
const routes = require('./routes');
const fs = require('fs');
const path = require('path');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://camagru-d216b-default-rtdb.europe-west1.firebasedatabase.app"
});

// Configuration Firebase
const appSettings = {
	apiKey: "AIzaSyCA7KM7VizUr6bMQqTK7sVeJ-6vA6RjUrk",
	authDomain: "camagru-d216b.firebaseapp.com",
	databaseURL: "https://camagru-d216b-default-rtdb.europe-west1.firebasedatabase.app",
	projectId: "camagru-d216b",
	storageBucket: "camagru-d216b.appspot.com",
	messagingSenderId: "351309562875",
	appId: "1:351309562875:web:d1d5c58f5fb22b48d8015e",
	measurementId: "G-2SXPRWGJ87"
}

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
	else if (url === '/signup')
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
	else if (url === '/signin')
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

firebase.initializeApp(appSettings);

const server = http.createServer(requestHandler);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
