import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getStorage, ref, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";

// Global variables
const auth = getAuth();
const storage = getStorage();
const logoutButton = document.getElementById('logout');
const video = document.getElementById('video');
const takePictureButton = document.getElementById('take-picture-btn');
const overlay = document.getElementById('overlay');
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
    setOverlaySize(); // Call to set overlay size after video metadata is loaded
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
      img.draggable="true"
      img.classList.add('stickers');
      
      stickersContainer.appendChild(img);
    }
  }
  catch (error) {
    console.error('Error loading stickers:', error);
  }
}

function setOverlaySize() {
  const overlay = document.getElementById('overlay');
  overlay.style.width = `${video.clientWidth}px`;
  overlay.style.height = `${video.clientHeight}px`;
}

function enableDragAndDrop() {
  const stickers = document.querySelectorAll('.stickers');

  stickers.forEach(sticker => {
    sticker.addEventListener('dragstart', (event) => {
      // Set the dragged sticker's URL into dataTransfer
      event.dataTransfer.setData('text/plain', event.target.src); // Use 'text/plain' MIME type
    });
  });
}

video.addEventListener('dragover', (event) => {
  event.preventDefault();
});
video.addEventListener('drop', (event) => {
  event.preventDefault();

  // Retrieve the sticker URL from the dragged item
  const stickerSrc = event.dataTransfer.getData('text/plain'); // Same 'text/plain' type as set during dragstart

  // Ensure you have a valid sticker source
  if (stickerSrc) {
    const rect = overlay.getBoundingClientRect(); // Use overlay's dimensions for positioning
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const droppedSticker = document.createElement('img');
    droppedSticker.src = stickerSrc;
    droppedSticker.classList.add('dropped-sticker');

    droppedSticker.style.position = 'absolute';
    droppedSticker.style.left = `${x - 25}px`; // Adjust for center positioning
    droppedSticker.style.top = `${y - 25}px`;

    // Append the dropped sticker to the overlay (not the video)
    overlay.appendChild(droppedSticker);
  }
});


// Update the size of the overlay when the window is resized
window.addEventListener('resize', setOverlaySize);

// Initialize video stream when the page loads
document.addEventListener('DOMContentLoaded', () => {
  setupCamera();
  loadStickers()
  .then(() => {
    enableDragAndDrop();
  });
});
