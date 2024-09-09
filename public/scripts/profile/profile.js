import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getAuth, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

import { initializeAuthListener, getCurrentUser } from "../auth.js";

const auth = getAuth();
const db = getFirestore();

const usernameField = document.getElementById("username");
const emailField = document.getElementById("email");

function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  messageDiv.innerHTML = message;
  messageDiv.style.display = 'block';
  messageDiv.style.opacity = 1;
	setTimeout(() => {
		messageDiv.style.display = "none";
	}, 3000);
}

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

async function promptForPassword() {
  return new Promise((resolve, reject) => {
    const password = prompt("Please enter your current password to proceed with updating your email:");

    if (password) {
      resolve(password);
    } else {
      reject("Password not provided");
    }
  });
}

// Function to update user email in Firebase Auth
async function updateUserEmailAuth(user, newEmail) {
  try {
    const password = await promptForPassword();
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    console.log("User reauthenticated successfully.");
    await updateEmail(user, newEmail);
    console.log('User email updated successfully in firebase Auth!');
  }
  catch (error) {
    if (error.code === "auth/wrong-password")
      error = "Wrong password provided";
    showMessage(error, "messageDiv");
    throw error;
  }
}

// Function to update user data in Firestore
async function updateUserDataFirestore(userRef, updatedFields) {
  try {
    await updateDoc(userRef, updatedFields);
    console.log('User data updated successfully in Firestore db!');
  }
  catch (error) {
    console.error('Error updating user data in Firestore db:', error);
    throw error;
  }
}

// Main function to save changes
async function saveChanges() {
  const user = getCurrentUser();
  if (!user) {
    console.error('No user is logged in!');
    return;
  }

  const userRef = doc(db, "users", user.uid);
  try {
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      console.error('User data not found in Firestore db!');
      return;
    }

    const docData = docSnap.data();
    const updatedFields = {};
    if (docData.username !== usernameField.value)
      updatedFields.username = usernameField.value;
    if (docData.email !== emailField.value)
      updatedFields.email = emailField.value;

    if (updatedFields.email) {
      console.log("Updating email in Firebase Auth", updatedFields.email, "for user", user);
      await updateUserEmailAuth(user, updatedFields.email);
    }

    if (updatedFields.username || updatedFields.email)
      await updateUserDataFirestore(userRef, updatedFields);
  }
  catch (error) {
    console.error("Error saving changes:", error);
  }
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
