import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile, getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  messageDiv.innerHTML = message;
  messageDiv.style.display = 'block';
  messageDiv.style.opacity = 1;
  setTimeout(() => {
    messageDiv.style.opacity = 0;
  }, 2000);
  
  if (message !== "User created successfully") {
    setTimeout(() => {
      messageDiv.style.display = "none";
    }, 3000);
  }
}

function validateForm() {
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username) {
    showMessage("Username cannot be empty", "signupMessage");
    return false;
  }
  
  if (!email) {
    showMessage("Email cannot be empty", "signupMessage");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMessage("Invalid email format!", "signupMessage");
    return false;
  }

  if (!password) {
    showMessage("Password cannot be empty", "signupMessage");
    return false;
  }

  if (password.length < 6) {
    showMessage("Password must be at least 6 characters long", "signupMessage");
    return false;
  }

  return true; // Validation passed
}

const signupForm = document.getElementById("submitSignup");

signupForm.addEventListener("click", (e) => {
  e.preventDefault();

  if (!validateForm())
    return;
  
  const auth = getAuth();

  const username = document.getElementById('username').value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  console.log(auth, username, email, password);
  
  createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      console.log("before updateProfile", cred.user);
      
      updateProfile(cred.user, { displayName: username })
        .then(() => {
          console.log("after updateProfile");
      const currentUser = auth.currentUser;
      console.log("Current user:", auth.currentUser);

      if (currentUser) {
        sendEmailVerification(currentUser)
        .then(() => {
          console.log("Email verification sent!");
          window.location.href = "/verify_email";
        })
        .catch((error) => {
          console.error("Error sending email verification: ", error);
        });
      }
      else
        console.error("User is not properly authenticated.");
      })
      .catch((error) => {
        console.log("Error updating profile: ", error);
      });
    })
    .catch((error) => {
      const errorCode = error.code;
      handleFirebaseError(errorCode, "signupMessage");
    });
});

function handleFirebaseError(errorCode, divId) {
  switch (errorCode) {
    case "auth/invalid-email":
      showMessage("Invalid email address!", "signupMessage");
      break;
    case "auth/email-already-in-use":
      showMessage("Email already exists!", "signupMessage");
      break;
    default:
      showMessage("Error creating user! Please try again.", "signupMessage");
      break;
  }
}

const togglePassword = document.getElementById('togglePassword');
const password = document.getElementById('password');

togglePassword.addEventListener('click', () => {
  const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
  password.setAttribute('type', type);
  togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
});

export { showMessage };
