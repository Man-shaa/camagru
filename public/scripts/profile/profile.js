import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getAuth, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

import { initializeAuthListener, getCurrentUser } from "../homepageServices/auth.js";

const auth = getAuth();
const db = getFirestore();

const usernameField = document.getElementById("username");
const emailField = document.getElementById("email");

initializeAuthListener((user) => {
  console.log('Logged user:', user);

  // Redirect if the user is not logged
  if (!user) {
    window.location.href = '/signin';
  }

  // Set fields value to current user data
  const userRef = doc(db, "users", user.uid);
  getDoc(userRef)
    .then((docSnap) => {
      if (docSnap.exists()) {
        usernameField.value = docSnap.data().username;
        emailField.value = docSnap.data().email;
      }
    });
});

function editField(fieldId) {
  const field = document.getElementById(fieldId);
  field.disabled = false;
  field.focus();
}

// updates user data in Firestore and Firebase Auth
function saveChanges() {
  const user = getCurrentUser();

  if (!user) {
    console.error('No user is logged in!');
  }

  const userRef = doc(db, "users", user.uid);
  getDoc(userRef)
  .then(async (docSnap) => {
    if (docSnap.exists()) {

      const updatedFields = {};
      if (docSnap.data().username !== usernameField.value)
        updatedFields.username = usernameField.value;
      if (docSnap.data().email !== emailField.value)
        updatedFields.email = emailField.value;
      
      if (updatedFields.email)
      {
        console.log("updating email in firebase Auth", updatedFields.email, "for user", user);
        // const userEmail = user.email;
        // const paswordCredential = prompt('Please enter your password to update your email');
        
        const credential = EmailAuthProvider.credential(user.email, 'test12');
        reauthenticateWithCredential(user, credential)
        .then(() => {
          console.log("User reauthenticated successfully.");
          // Proceed with your logic here
          updateEmail(user, updatedFields.email)
          .then(() => {
            // relog user to update email in user object
          
            console.log('User email updated successfully in firebase Auth!');
          })
          .catch((error) => {
              console.error('Error updating user email in firebase Auth : ', error);
            });
          })
        .catch((error) => {
          console.error("Error reauthenticating user:", error);
        });
      }
      updateDoc(userRef, updatedFields)
      .then(() => {
        console.log('User data updated successfully in firestore db!');
      })
      .catch((error) => {
        console.error('Error updating user data in firestore db : ', error);
      });
    }
    else {
      console.error('User data not found in firestore db!');
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Edit buttons click listener
  const editButtons = document.querySelectorAll(".edit-btn");
  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const fieldId = this.getAttribute("data-field-id");
      editField(fieldId);
    });
  });

  // submit button click listener
  const saveButton = document.getElementById("save-btn");
  saveButton.addEventListener("click", () => {
    saveChanges();
    const inputFields = document.querySelectorAll("input");

    inputFields.forEach((field) => {
      field.disabled = true;
    });
  });
});
