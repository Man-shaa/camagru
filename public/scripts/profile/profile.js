import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getAuth, updateEmail, EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification, signOut} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { initializeAuthListener, getCurrentUser, updateCurrentUser } from "../auth.js";

const auth = getAuth();
const db = getFirestore();

const usernameField = document.getElementById("username");
const emailField = document.getElementById("email");
const emailNotificationsField = document.getElementById("notifications");

function showMessage(message, divId, duration) {
  const messageDiv = document.getElementById(divId);
  messageDiv.innerHTML = message;
  messageDiv.style.display = 'block';
  messageDiv.style.opacity = 1;
  setTimeout(() => {
    messageDiv.style.display = "none";
  }, duration || 3000);
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

const logoutButton = document.getElementById('logout');

// Logout button listener
logoutButton.addEventListener('click', () => {
	signOut(auth)
	.then(() => {
		updateCurrentUser(null);
		const logoutBtnContainer = document.getElementById('logout-btn-container');
		const signinBtnContainer = document.getElementById('signin-btn-container');

		if (logoutBtnContainer)
      logoutBtnContainer.style.display = 'none';
		if (signinBtnContainer)
      signinBtnContainer.style.display = 'block';
	})
	.catch((error) => {
		console.log('Error signing out:', error);
	});
});

// Enable field for editing
function editField(fieldId) {
  const field = document.getElementById(fieldId);
  field.disabled = !field.disabled;
  field.focus();
}

// Display a prompt for password
async function promptForPassword() {
  return new Promise((resolve, reject) => {
    const password = prompt("Please enter your current password to proceed with updating your email:");

    if (password) {
      resolve(password);
    }
    else
      reject("Password not provided");
  });
}

// Function to update user email in Firebase Auth
async function updateUserEmailAuth(user, newEmail) {
  try {
    await reauthenticateUser(user);
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
    if (docData.emailNotifications !== emailNotificationsField.checked)
      updatedFields.emailNotifications = emailNotificationsField.checked;

    console.log('updatedFields:', updatedFields, 'length:', Object.keys(updatedFields).length);
    if (Object.keys(updatedFields).length !== 0)
      await updateUserDataFirestore(userRef, updatedFields);

    if (updatedFields.email) {
      await updateUserEmailAuth(user, updatedFields.email);

      // redirect to verify email page
      sendEmailVerification(user)
      .then(() => {
        showMessage("Please verify your new email", "messageDiv");
        setTimeout(() => {
          console.log("Email verification sent!");
          window.location.href = "/verify_email";
        }, 3000);
      })
      .catch((error) => {
        console.error("Error sending email verification: ", error);
      });
    }
  }
  catch (error) {
    console.error("Error saving changes:", error);
  }
}

// reuthenticate user with prompt for password
async function reauthenticateUser(user) {
  try {
    const password = await promptForPassword();
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    console.log("User reauthenticated successfully.");
  }
  catch (error) {
    throw error; // Re-throw to be handled in the caller function
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

  // Delete account button click listener
  const deleteButton = document.getElementById("delete-account-btn");
  deleteButton.addEventListener("click", () => {
    const user = getCurrentUser();
    if (!user) {
      console.error('No user is logged in!');
      return;
    }
    
    window.location.href = '/delete_account';
  });
});

export { reauthenticateUser };