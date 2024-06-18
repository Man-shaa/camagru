const express = require('express');
const firebase = require('firebase/app');
require('firebase/database');
require('firebase/auth');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
app.use(cors());
app.use(bodyParser.json());

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDR7qOz9llvvh6ui1f8f7RC-e8M64zB9gE",
    authDomain: "camagru-f29e5.firebaseapp.com",
    databaseURL: "https://camagru-f29e5-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "camagru-f29e5",
    storageBucket: "camagru-f29e5.appspot.com",
    messagingSenderId: "65788784839",
    appId: "1:65788784839:web:d15b5a7e73048b31894ee2"
  };

firebase.initializeApp(firebaseConfig);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
