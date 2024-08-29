import { createUserWithEmailAndPassword, getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

const auth = getAuth();

const signupForm = document.getElementById("submitSignup");

signupForm.addEventListener("click", (e) => {
  e.preventDefault();
  console.log("Form submitted");

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      console.log("User created : ", cred.user);
    })
    .catch((error) => {
      console.log(error.message);
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