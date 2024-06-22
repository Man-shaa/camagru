const firebase = require('firebase/app');
require('firebase/database');
require('firebase/auth');

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

module.exports = firebase;