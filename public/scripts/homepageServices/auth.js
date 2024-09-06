import { onAuthStateChanged, getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

// global variables
const auth = getAuth();

export let currentUser = null;

// Function to update the variable
// USELESS ???????????????//
export function updateCurrentUser(user) {
  currentUser = user;
}

// User auth change listener
onAuthStateChanged(auth, (user) => {
	console.log("user status: ", user);
	const signinBtnContainer = document.getElementById('signin-btn-container');
	const logoutBtnContainer = document.getElementById('logout-btn-container');
	const uploadBtnContainer = document.getElementById('upload-container');

	if (user) {
		updateCurrentUser(user);
		logoutBtnContainer.style.display = 'block';
		uploadBtnContainer.style.display = 'flex';
		currentUser = user;
	} else {
		signinBtnContainer.style.display = 'block';
	}
});
