import { signInWithEmailAndPassword, getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
// import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

function showMessage(message, divId)
{
  const messageDiv = document.getElementById(divId);
  messageDiv.innerHTML = message;
  messageDiv.style.display = 'block';
  messageDiv.style.opacity = 1;
  setTimeout(() => {
    messageDiv.style.opacity = 0;
  }, 2000);
  
  if (message !== "Successfully logged in")
  {
    setTimeout(() => {
      messageDiv.style.display = "none"; // Hide the message after fade-out
    }, 3000); // Delay for 6 seconds (1 second after the opacity transition)
  }
}

const signinForm = document.getElementById('submitSignin');

signinForm.addEventListener('click', (e) => {
	e.preventDefault();
	const email = document.getElementById('email').value;
	const password = document.getElementById('password').value;

	const auth = getAuth();

	signInWithEmailAndPassword(auth, email, password)
	.then((cred) => {
		showMessage('Successfully logged in', 'signinMessage');
		const userData = {
			email: email,
			uid: cred.user.uid,
		};
		localStorage.setItem('loggedUser', userData.uid);
		setTimeout(() => {
			window.location.href = '/homepage';
		}, 2000);
	}).catch((err) => {
		const errorCode = err.code;
		if (errorCode === 'auth/invalid-credential') {
			showMessage('Invalid email or password', 'signinMessage');
		}
		else {
			showMessage('Account does not exist', 'signinMessage');
		}
	});
});

const togglePassword = document.getElementById('togglePassword');

togglePassword.addEventListener('click', () => {
  // Toggle the type attribute using getAttribute() and setAttribute()
  const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
  password.setAttribute('type', type);
  
  // Toggle the eye / eye slash icon
  togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
});