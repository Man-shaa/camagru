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
      messageDiv.style.display = "none"; // Hide the message after fade-out
    }, 3000); // Delay for 6 seconds (1 second after the opacity transition)
  }
}

const signupForm = document.getElementById("submitSignup");
signupForm.addEventListener("click", (e) => {
  e.preventDefault();

  const auth = getAuth();
  const db = getFirestore();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      console.log("User created : ", cred.user);
      const userData = {
        email: email,
        uid: cred.user.uid,
      };
      showMessage("User created successfully", "signupMessage")
      // const docRef = doc(db, "users", userData.uid);
      // setDoc(docRef, userData)
      // .then(() => {
      //   setTimeout(() => {
      //     window.location.href = "/signin";
      //   }, 2000);
      // })
      // .catch((error) => {
      //   console.log("error writting document: ", error);
      // });
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode === "auth/email-already-in-use") {
        showMessage("Email already Exists !", "signupMessage");
      }
      else
      {
        showMessage("Error creating user !", "signupMessage");
      }
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

export { showMessage };