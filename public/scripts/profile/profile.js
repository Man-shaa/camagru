import { initializeAuthListener, getCurrentUser } from "../homepageServices/auth.js";

function initProfilePage() {
  const user = getCurrentUser();

  console.log("user :", user);
  if (!user) {
    // Redirect to login page or show an error message
    window.location.href = '/signin';
    return;
  }

  // Fetch and display user profile information
  console.log('Current user:', user);
}

// Initialize authentication listener and ensure profile page setup happens after user state is known
initializeAuthListener((user) => {
  if (user) {
    initProfilePage();
  } else {
    window.location.href = '/signin'; // Redirect if no user is found
  }
});

function editField(fieldId) {
  const field = document.getElementById(fieldId);
  field.disabled = false;
  field.focus();
}

function saveChanges() {
  // Code to save changes to Firebase or other backend logic
  console.log('Changes saved successfully!');
}

document.addEventListener("DOMContentLoaded", () => {
  const editButtons = document.querySelectorAll(".edit-btn");

  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const fieldId = this.getAttribute("data-field-id");
      console.log(`Editing field with ID: ${fieldId}`);
      editField(fieldId);
    });
  });

  const saveButton = document.getElementById("save-btn");
  saveButton.addEventListener("click", () => {
    saveChanges();
  });
});
