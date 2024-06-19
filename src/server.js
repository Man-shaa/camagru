const firebase = require('firebase/app');
require('firebase/database');
require('firebase/auth');

const admin = require("firebase-admin");

var serviceAccount = require("../config/camagru-private-key.json");

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

firebase.initializeApp(appSettings);

const http = require('http');
const fs = require('fs');
const path = require('path');

// Handle routes
const router = (req, res) => {
  const url = req.url;
  const method = req.method;
  console.log({url}, {method});

  if (url === '/')
  {
    serveStaticFile(path.join(__dirname, '../public/index.html'), 'text/html', res);
  }
  else if (url === '/register' && method === 'POST')
    handleRegister(req, res);
  else if (url === '/users' && method === 'GET')
  {
    getUsers(req, res);
  }
  else if (url === '/welcome' & method === 'GET')
  {
    console.log("GET welcome !")
    res.writeHead(200);
    res.write("Welcome to Camagru !");
    res.end();
  }
  else if (url.match(/\.css$/))
    serveStaticFile(path.join(__dirname, '../public', url), 'text/css', res);
  else
  {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page Not Found');
  }
};

const getUsers = async (req, res) => {
  console.log("GET users !")

  try {
    const listUsers = await admin.auth().listUsers();
    const users = listUsers.users.map(userRecord => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      // Add any other user properties you want to return
    }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
  } catch (error) {
    console.error('Error listing users:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to fetch users' }));
  }
};

const serveStaticFile = (filePath, contentType, res) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
};

const handleRegister = (req, res) => {
  console.log("POST register !")
  const registerForm = document.getElementById('register-form');

  registerForm.addEventListener('submit', async (event) => {
    console.log('Form submitted!');
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try
    {
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      console.log('User registered:', user);

      // Optionally, handle success message or redirect
    }
    catch (error)
    {
      console.error('Error registering user:', error.message);
    }
  });
};

const server = http.createServer(router);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
