import { getAnalytics } from "firebase/analytics"
import { initializeApp } from "firebase/app"
import { getDatabase, ref, push } from "firebase/database"

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

const app = initializeApp(appSettings)
const analytics = getAnalytics(app);
const db = getDatabase(app)
const moviesInDB = ref(db, "movies")

// console.log("database : ", db)

const inputField = document.getElementById("input-field");
// if (typeof document === 'undefined') {
// 	console.log("document undefined")
// }
// const addButton = document.getElementById("add-button");

// window.addButton.addEventListener("click", function()
// {
// 	let inputValue = inputField.value;

// 	push(moviesInDB, inputValue);
// 	console.log(`"${inputValue}" added to database`);
// });
