import { getAuth, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { deleteObject, ref, getStorage } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

import { getCurrentUser, initializeAuthListener } from "../auth/auth.js";
import { deleteUserFirestore, getUserFiles } from "../firebase/firestore-db.js";

const auth = getAuth();
const storage = getStorage()
const db = getFirestore();

const passwordField = document.getElementById("password");
let currentUser = getCurrentUser();

initializeAuthListener((user) => {
	if (user) {
		console.log('Logged user:', user);
		currentUser = user;
	}
	else {
		window.location.href = '/signin';
	}
});

function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  messageDiv.innerHTML = message;
  messageDiv.style.display = 'block';
  messageDiv.style.opacity = 1;
	setTimeout(() => {
		messageDiv.style.display = "none";
	}, 3000);
}

// Function to delete image documents in Firestore based on uniqueFileName
async function deleteUserImagesByUniqueFileNames(uniqueFileNames) {
  try {
    const imagesCollectionRef = collection(db, 'images');
    
    for (const uniqueFileName of uniqueFileNames) {
      // Query the images collection for the document with the matching uniqueFileName
      const q = query(imagesCollectionRef, where('uniqueImageName', '==', uniqueFileName));
      const querySnapshot = await getDocs(q);

      // Iterate through the results and delete the documents
      querySnapshot.forEach(async (docSnap) => {
        const docRef = doc(db, 'images', docSnap.id); // Document reference
        await deleteDoc(docRef); // Delete the document in Firestore
        console.log(`Deleted Firestore document for uniqueFileName: ${uniqueFileName}`);
        
        // Also delete the file from Firebase Storage
        const fileRef = ref(storage, `images/${uniqueFileName}`);
        await deleteObject(fileRef); // Delete the file in Firebase Storage
        console.log(`Deleted file from Firebase Storage: ${uniqueFileName}`);
      });
    }
  }
  catch (error) {
    console.error("Error deleting user images:", error);
    throw error;
  }
}

// Delete user account from Firebase Auth
async function deleteUserAuth(user) {
  try {
    await deleteUser(user)
    console.log("User account deleted successfully from Firebase Auth !");
  }
  catch (error) {
    console.error("Error deleting user account:", error);
    throw error;
  }
}

document.addEventListener('DOMContentLoaded', function() {
	// back to previous page
	const backButton = document.getElementById('back-btn');
  if (backButton) {
    backButton.addEventListener('click', () => {
      window.history.back();
    });
  }

	// delete button
	const passwordField = document.getElementById('password');
	const deleteButton = document.getElementById('delete-btn');

	deleteButton.addEventListener('click', async function() {		
		if (confirm("Are you sure you want to delete your account?")) {
      try {
				await deleteAccount(currentUser)
      }
      catch (error) {
				console.error("Error deleting account:", error);
      }
    }

	});
});

// reuthenticate user with prompt for password
async function reauthenticateUser(user, password) {
  try {
		console.log(user.email, password);
		const credential = EmailAuthProvider.credential(user.email, password);
		await reauthenticateWithCredential(user, credential);
		console.log("User reauthenticated successfully.");
  }
  catch (error) {
    throw error; // Re-throw to be handled in the caller function
  }
}

// Delete an account on Firebase Auth and Firestore
async function deleteAccount(user) {
  try {
		const password = passwordField.value;
    await reauthenticateUser(user, password);

    const uniqueFileNames = await getUserFiles(user.uid);

    // Delete Firestore documents and Firebase Storage images for the user
    await deleteUserImagesByUniqueFileNames(uniqueFileNames); // Deletes the files and documents

    // Delete the user's Firestore document
    await deleteUserFirestore(user);

    // Delete the user's Firebase Auth account
    await deleteUserAuth(user);

    window.location.href = "/signin";
  }
  catch (error) {
    if (error.code === "auth/wrong-password")
      error = "Wrong password provided";
    else if (error.code === "auth/missing-password")
      error = "Password is required";
    else if (error.code === "auth/too-many-requests")
      error = "Too many attempts. You can immediately restore it by resetting your password or you can try again later.";
    showMessage(error, "messageDiv", 7000);
  }
}
