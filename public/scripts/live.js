import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

// Global variables
const auth = getAuth();
const logoutButton = document.getElementById('logout');
const video = document.getElementById('video');
const takePictureButton = document.getElementById('take-picture-btn');
let isPictureTaken = false;
let videoWidth, videoHeight;

// Logout button listener
logoutButton.addEventListener('click', () => {
  signOut(auth)
    .then(() => {
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

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  video.onloadedmetadata = () => {
    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;
    video.play();
  };
}

function takePicture() {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

function displayPicture(imageDataUrl) {
  video.style.backgroundImage = `url(${imageDataUrl})`;
  video.style.backgroundSize = 'cover';
  video.style.backgroundPosition = 'center';
  video.style.width = `${videoWidth}px`;
  video.style.height = `${videoHeight}px`;
  video.srcObject = null; // Stop video stream
}

takePictureButton.addEventListener('click', () => {
  if (isPictureTaken) {
    // Switch back to live video
    setupCamera();
    video.style.backgroundImage = '';
    video.style.width = '100%';
    video.style.height = 'auto';
    takePictureButton.textContent = 'Take Picture';
    isPictureTaken = false;
  }
	else {
    // Take a picture
    const imageDataUrl = takePicture();
    displayPicture(imageDataUrl);
    takePictureButton.textContent = 'Back to Live';
    isPictureTaken = true;
  }
});

// Initialize video stream when the page loads
document.addEventListener('DOMContentLoaded', () => {
  setupCamera();
});
