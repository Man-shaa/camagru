import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { updateCurrentUser } from "../auth.js";

// global variables
const auth = getAuth();

const logoutButton = document.getElementById('logout');

// Logout button listener
logoutButton.addEventListener('click', () => {
	signOut(auth)
	.then(() => {
		updateCurrentUser(null);
		const logoutBtnContainer = document.getElementById('logout-btn-container');
		const signinBtnContainer = document.getElementById('signin-btn-container');

		if (logoutBtnContainer) logoutBtnContainer.style.display = 'none';
		if (signinBtnContainer) signinBtnContainer.style.display = 'block';
		window.location.reload();
	})
	.catch((error) => {
		console.log('Error signing out:', error);
	});
});
