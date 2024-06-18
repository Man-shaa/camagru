const express = require('express');
const firebase = require('firebase/app');
require('firebase/database');
require('firebase/auth');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
const path = require('path');

app.use(express.static(path.join(__dirname, '../public')));
app.use('/src', express.static(path.join(__dirname, 'src')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
app.use(cors());
app.use(bodyParser.json());

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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
