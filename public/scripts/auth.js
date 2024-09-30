import { onAuthStateChanged, getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

// Global variables
const auth = getAuth();

let currentUser = null;

// Function to initialize auth listener
export function initializeAuthListener(callback) {
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (callback) {
      callback(user);
    }
  });
}

// Function to get the current user
export function getCurrentUser() {
  return currentUser;
}

// Function to update the variable
export function updateCurrentUser(user) {
  currentUser = user;
}

const elements = {
  signinBtnContainer: document.getElementById('signin-btn-container'),
  logoutBtnContainer: document.getElementById('logout-btn-container'),
  uploadBtnContainer: document.getElementById('upload-container'),
  liveBtnContainer: document.getElementById('live-btn-container')
};

function updateUI(user) {
  if (user) {
    if (elements.signinBtnContainer)
			elements.signinBtnContainer.style.display = 'none';
    if (elements.logoutBtnContainer)
			elements.logoutBtnContainer.style.display = 'block';
    if (elements.uploadBtnContainer)
			elements.uploadBtnContainer.style.display = 'flex';
    if (elements.liveBtnContainer)
			elements.liveBtnContainer.style.display = 'flex';
  }
  else {
    if (elements.signinBtnContainer)
			elements.signinBtnContainer.style.display = 'block';
    if (elements.logoutBtnContainer)
			elements.logoutBtnContainer.style.display = 'none';
    if (elements.uploadBtnContainer)
			elements.uploadBtnContainer.style.display = 'none';
    if (elements.liveBtnContainer)
			elements.liveBtnContainer.style.display = 'none';
  }
}

// Initialize auth listener
onAuthStateChanged(auth, (user) => {
  updateUI(user);
	updateCurrentUser(user);
});
