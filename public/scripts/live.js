import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getStorage, ref, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";

// Global variables
const auth = getAuth();
const storage = getStorage();
const logoutButton = document.getElementById('logout');
const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const takePictureButton = document.getElementById('take-picture-btn');
let isPictureTaken = false;
let stickers = []; // Track stickers and their positions

// Logout button listener
logoutButton.addEventListener('click', () => {
  signOut(auth)
    .then(() => {
      const logoutBtnContainer = document.getElementById('logout-btn-container');
      if (logoutBtnContainer) logoutBtnContainer.style.display = 'none';
    })
    .catch((error) => console.log('Error signing out:', error));
});

// Setup camera stream
async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  video.onloadedmetadata = () => {
    video.play();
    syncOverlaySize();
    updateOverlayPosition();
  };
}

// Resize and sync the overlay and video size
function syncOverlaySize() {
  const videoRect = video.getBoundingClientRect();
  overlay.style.width = `${videoRect.width}px`;
  overlay.style.height = `${videoRect.height}px`;

  // Scaling factor based on the current width of the video
  const videoScaleFactorX = videoRect.width / video.videoWidth;
  const videoScaleFactorY = videoRect.height / video.videoHeight;

  // Update sticker positions and resize them
  stickers.forEach(sticker => {
    const stickerElement = sticker.element;

    // Update the position relative to the current video size
    const relativeX = sticker.relativeX * videoRect.width;
    const relativeY = sticker.relativeY * videoRect.height;
    stickerElement.style.left = `${relativeX}px`;
    stickerElement.style.top = `${relativeY}px`;

    // Adjust sticker size proportionally, but keep it small
    const newWidth = 64 * videoScaleFactorX;
    const newHeight = 64 * videoScaleFactorY;
    stickerElement.style.width = `${Math.min(newWidth, 64)}px`;
    stickerElement.style.height = `${Math.min(newHeight, 64)}px`;
  });
}

// Adjust the overlay size based on the video wrapper size
function updateOverlayPosition() {
  const videoWrapper = document.getElementById('video-wrapper');
  const overlay = document.getElementById('overlay');
  
  overlay.style.width = `${videoWrapper.clientWidth}px`;
  overlay.style.height = `${videoWrapper.clientHeight}px`;
}

// Handle taking and displaying a picture
function takePicture() {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return (canvas.toDataURL('image/png'));
}

function displayPicture(imageDataUrl) {
  video.style.backgroundImage = `url(${imageDataUrl})`;
  video.style.backgroundSize = 'cover';
  video.style.backgroundPosition = 'center';
  video.srcObject = null; // Stop video stream
  syncOverlaySize();
  updateOverlayPosition();
}

// Capture button event listener
takePictureButton.addEventListener('click', () => {
  if (isPictureTaken) {
    setupCamera();
    video.style.backgroundImage = '';
    takePictureButton.textContent = 'Take Picture';
    isPictureTaken = false;
  }
  else {
    const imageDataUrl = takePicture();
    displayPicture(imageDataUrl);
    takePictureButton.textContent = 'Back to Live';
    isPictureTaken = true;
  }
});

// Enable drag and drop for stickers
function enableDragAndDrop() {
  const stickersElements = document.querySelectorAll('.stickers');

  stickersElements.forEach(sticker => {
    sticker.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', event.target.src);
    });
  });
}

video.addEventListener('dragover', (event) => event.preventDefault());

video.addEventListener('drop', (event) => {
  event.preventDefault();
  const stickerSrc = event.dataTransfer.getData('text/plain');
  if (stickerSrc) {
    const overlayRect = overlay.getBoundingClientRect();
    const x = (event.clientX - overlayRect.left - 32) / overlayRect.width;
    const y = (event.clientY - overlayRect.top - 32) / overlayRect.height;

    const droppedSticker = document.createElement('img');
    droppedSticker.src = stickerSrc;
    droppedSticker.classList.add('dropped-sticker');

    // Set the size to be responsive and maintain the aspect ratio
    droppedSticker.style.width = '10vw';
    droppedSticker.style.maxWidth = '64px';
    droppedSticker.style.height = 'auto';
    
    // Set the position relative to the overlay
    droppedSticker.style.left = `${x * overlayRect.width}px`;
    droppedSticker.style.top = `${y * overlayRect.height}px`;

    overlay.appendChild(droppedSticker);

    // Save relative position for responsiveness
    stickers.push({
      element: droppedSticker,
      relativeX: x,
      relativeY: y,
      originalWidth: 64,
      originalHeight: 64
    });
  }
});

// Load stickers dynamically
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
      img.draggable = "true";
      img.classList.add('stickers');
      stickersContainer.appendChild(img);
    }
  }
  catch (error) {
    console.error('Error loading stickers:', error);
  }
}

// Initialize everything on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  setupCamera();
  loadStickers().then(enableDragAndDrop);
  window.addEventListener('resize', syncOverlaySize);
  window.addEventListener('resize', updateOverlayPosition);
});
