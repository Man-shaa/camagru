import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
  function checkVerificationClientSide() {
    const auth = getAuth();
    const db = getFirestore();

    
    // Monitor auth state changes
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload();
        console.log("User's email verification status:", user.emailVerified);
        console.log("User's displayName:", user.displayName); // Display name of the user
        
        if (user.emailVerified) {
          // Create user data in Firestore
          const userData = {
            username: user.displayName,
            email: user.email,
            uid: user.uid,
          };

          console.log("User data:", userData);

          const docRef = doc(db, "users", userData.uid);
          setDoc(docRef, userData)
          .then(() => {
            console.log("User data saved successfully");
            window.location.href = '/signin';
          })
          .catch((error) => {
            console.error("Error saving user data: ", error);
          });
        }
        else
          alert("Your email is not verified yet. Please check your email.");
      }
      else
        window.location.href = '/signin';
    });
  }

  // Event listener for the "click here" link
  document.getElementById('checkVerificationLink').addEventListener('click', (e) => {
    e.preventDefault();
    checkVerificationClientSide();
  });
});
