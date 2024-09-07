import { createUserWithEmailAndPassword, getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";


function showMessage(message, divId)
{
  const messageDiv = document.getElementById(divId);
  messageDiv.innerHTML = message;
  messageDiv.style.display = 'block';
  messageDiv.style.opacity = 1;
  setTimeout(() => {
    messageDiv.style.opacity = 0;
  }, 2000);
  
  if (message !== "User created successfully")
  {
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

  // Validate email format using a regular expression
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
    return ;
  
  const auth = getAuth();
  const db = getFirestore();

	const username = document.getElementById('username').value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  console.log("Username: ", username);
  createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      console.log("User created : ", cred.user);
      const userData = {
        username: username,
        email: email,
        uid: cred.user.uid,
      };
      showMessage("User created successfully", "signupMessage")
      const docRef = doc(db, "users", userData.uid);
      setDoc(docRef, userData)
      .then(() => {
        setTimeout(() => {
          window.location.href = "/signin";
        }, 2000);
      })
      .catch((error) => {
        console.log("error writting document: ", error);
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

togglePassword.addEventListener('click', () => {
  // Toggle the type attribute using getAttribute() and setAttribute()
  const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
  password.setAttribute('type', type);
  
  // Toggle the eye / eye slash icon
  togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
});

export { showMessage };