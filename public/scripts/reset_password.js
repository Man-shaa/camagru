import { sendPasswordResetEmail, getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

import { initializeAuthListener, updateCurrentUser } from "./auth.js";

function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  messageDiv.innerHTML = message;
  messageDiv.style.display = 'block';
  messageDiv.style.opacity = 1;
	setTimeout(() => {
		messageDiv.style.display = "none";
	}, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
	
	initializeAuthListener((user) => {
		console.log('Logged user:', user);
	});

	// back to previous page
	const backButton = document.getElementById('back-btn');
  if (backButton) {
    backButton.addEventListener('click', () => {
      window.history.back();
    });
  }
	
	// submit button
	const emailField = document.getElementById('email');
	const submitButton = document.getElementById('submit-btn');

	submitButton.addEventListener('click', function() {
		const auth = getAuth();
		const email = emailField.value;
		
		if (!validateEmail(email)) return;
	
		// Send password reset email
		sendPasswordResetEmail(auth, email)
			.then(() => {
				showMessage("Password reset email sent, redirection to signin page", "messageDiv");
	
				setTimeout(() => {
					signOut(auth)
						.then(() => {
							updateCurrentUser(null);
							window.location.href = '/signin';
						})
						.catch((error) => {
							console.log('Error signing out:', error);
						});
				}, 3000);
			})
			.catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
				console.log(errorCode, ": error sending password reset email", errorMessage);
			});
	});
});

function validateEmail(email) {
	if (!email) {
    showMessage("Email cannot be empty", "messageDiv");
    return (false);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMessage("Invalid email format!", "messageDiv");
    return (false);
  }
	return (true);
}
