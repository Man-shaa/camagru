import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getStorage, ref, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";

// Global variables
const auth = getAuth();
const storage = getStorage();
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
    video.style.width = `${videoWidth}px`;
    video.style.height = `${videoHeight}px`;
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
    setupCamera(); // Switch back to live video
    video.style.backgroundImage = '';
    takePictureButton.textContent = 'Take Picture';
    isPictureTaken = false;
  }
  else {
    const imageDataUrl = takePicture();
    displayPicture(imageDataUrl); // Display captured image
    takePictureButton.textContent = 'Back to Live';
    isPictureTaken = true;
  }
});

// Function to load stickers dynamically
async function loadStickers() {
  const stickersFolderRef = ref(storage, 'stickers/');

  const stickersContainer = document.querySelector('.stickers-container');

  try {
    const stickersList = await listAll(stickersFolderRef);

    for (const itemRef of stickersList.items) {
      const url = await getDownloadURL(itemRef);

      const img = document.createElement('img');
      img.src = url;
      img.alt = `Sticker: ${itemRef.name}`;
      img.classList.add('stickers');
      
      stickersContainer.appendChild(img);
    }
  }
  catch (error) {
    console.error('Error loading stickers:', error);
  }
}

// Initialize video stream when the page loads
document.addEventListener('DOMContentLoaded', () => {
  setupCamera();
  loadStickers();
});
