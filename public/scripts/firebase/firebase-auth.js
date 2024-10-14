import { updateEmail } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

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

export { updateUserEmailAuth };