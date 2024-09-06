import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { currentUser } from "./auth.js";

// global variables
const auth = getAuth();

const logoutButton = document.getElementById('logout');

// Logout button listener
logoutButton.addEventListener('click', () => {
	signOut(auth)
	.then(() => {
		currentUser = null;
		window.location.reload();
	})
	.catch((error) => {
		console.log('Error signing out:', error);
	});
});
