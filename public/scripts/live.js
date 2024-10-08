import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, addDoc, collection } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getStorage, ref, listAll, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";
import { initializeAuthListener, getCurrentUser } from "./auth.js";
import { getUserFiles } from "./homepageServices/firestore-db.js";

const auth = getAuth();
const storage = getStorage();
const db = getFirestore();

// Global variables
const logoutButton = document.getElementById('logout');
const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const takePictureButton = document.getElementById('take-picture-btn');
const savePictureButton = document.getElementById('save-picture-btn');
const videoWrapper = document.getElementById('video-wrapper');
const cancelImageNameBtn = document.getElementById('cancelImageNameBtn');
const saveImageNameBtn = document.getElementById('saveImageNameBtn');
let isPictureTaken = false;
let stickers = [];
let currentUser = null;
let imageName = '';

// init auth listener
initializeAuthListener((user) => {
  if (!user) {
    window.location.href = '/signin';
  }
  currentUser = getCurrentUser();
});

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

  const videoScaleFactorX = videoRect.width / video.videoWidth;
  const videoScaleFactorY = videoRect.height / video.videoHeight;

  stickers.forEach(sticker => {
    const stickerElement = sticker.element;

    const relativeX = sticker.relativeX * videoRect.width;
    const relativeY = sticker.relativeY * videoRect.height;
    stickerElement.style.left = `${relativeX}px`;
    stickerElement.style.top = `${relativeY}px`;

    const newWidth = sticker.originalWidth * videoScaleFactorX;
    const newHeight = sticker.originalHeight * videoScaleFactorY;
    stickerElement.style.width = `${Math.min(newWidth, 64)}px`;
    stickerElement.style.height = `${Math.min(newHeight, 64)}px`;
  });
}

// Adjust the overlay size based on the video wrapper size
function updateOverlayPosition() {
  const overlay = document.getElementById('overlay');

  overlay.style.width = `${videoWrapper.clientWidth}px`;
  overlay.style.height = `${videoWrapper.clientHeight}px`;
}

// Handle taking and displaying a picture
function takePicture() {
  const videoRect = video.getBoundingClientRect();

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  canvas.width = videoRect.width;
  canvas.height = videoRect.height;
  
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return (canvas.toDataURL('image/png'));
}

document.getElementById('fileInput').addEventListener('change', function(event) {
	const file = event.target.files[0];
	if (file) {
    const uploadedImage = URL.createObjectURL(file);
    setupPictureView(uploadedImage);
	}
});

// Trigger file input when the upload button is clicked
document.getElementById('uploadButton').addEventListener('click', function() {
	document.getElementById('fileInput').click();
});

function displayPicture(imageDataUrl) {
  const videoRect = videoWrapper.getBoundingClientRect();
  console.log(videoRect);

  video.srcObject = null;
  video.style.backgroundImage = `url(${imageDataUrl})`;
  video.style.backgroundSize = '100%';
  video.style.backgroundPosition = 'center';

  video.style.width = videoRect.width;
  video.style.height = videoRect.height;

  syncOverlaySize();
  updateOverlayPosition();
}

function setupLiveView() {
  setupCamera();
  video.style.backgroundImage = '';
  takePictureButton.textContent = 'Take Picture';
  isPictureTaken = false;
  savePictureButton.style.display = 'none';
}

function setupPictureView(imageDataUrl) {
  displayPicture(imageDataUrl);
  takePictureButton.textContent = 'Back to Live';
  isPictureTaken = true;
  savePictureButton.style.display = 'block';
}

// Capture button event listener
takePictureButton.addEventListener('click', () => {
  if (isPictureTaken) {
    setupLiveView()
  }
  else {
  const imageDataUrl = takePicture();
  setupPictureView(imageDataUrl)
  }
});

function uploadImage(currentUserId, file) {
  const uniqueFileName = `${currentUserId}_${Date.now()}_${imageName}`;
  const imageStorageRef = ref(storage, 'images/' + uniqueFileName);
  const metadata = {
    customMetadata: {
      userId: currentUserId,
      fileName: imageName
    }
  };

  const blobFile = base64ToBlob(file, 'image/png');

  uploadBytes(imageStorageRef, blobFile, metadata)
  .then((snapshot) => {
    getDownloadURL(snapshot.ref)
    .then((url) => {
      console.log("final url:", url);

      // Add to 'images' collection
      addDoc(collection(db, 'images'), {
        uniqueImageName: uniqueFileName,
        imageUrl: url,
        fileName: imageName,
        userId: currentUserId,
        createdAt: new Date()
      });

      // Add to '/users/$currentUserId/uploads/' collection
      const userUploadsRef = collection(db, `users/${currentUserId}/uploads`);
      addDoc(userUploadsRef, {
        uniqueImageName: uniqueFileName,
        fileName: imageName,
        imageUrl: url,
        uploadedAt: new Date()
      })
      .then(() => {
        console.log("File details added to user uploads.");
      })
      .catch((error) => {
        console.error("Error adding file details to user uploads:", error);
      });
    })
    .catch((error) => {
      console.log("Error getting download URL:", error);
    });
  })
  .catch((error) => {
    console.log("Error uploading file:", error);
  });
}

function base64ToBlob(base64, type) {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  return new Blob([byteNumbers], { type: type });
}

function drawStickersSequentially(context, canvas, stickers) {
  const overlayRect = overlay.getBoundingClientRect();
  const drawStickerPromises = stickers.map(sticker => {
    return new Promise((resolve) => {
      const stickerImage = new Image();
      stickerImage.src = sticker.element.src;
      stickerImage.onload = () => {
        const stickerRect = sticker.element.getBoundingClientRect();

        const xPos = stickerRect.left - overlayRect.left;
        const yPos = stickerRect.top - overlayRect.top;

        context.drawImage(stickerImage, xPos, yPos, sticker.originalWidth, sticker.originalHeight);
        resolve();
      };
    });
  });

  Promise.all(drawStickerPromises).then(() => {
    const combinedImage = canvas.toDataURL('image/png');
    console.log(combinedImage);
    // Call uploadImage here with the imageName that has been set in the modal
    uploadImage(currentUser.uid, combinedImage);
  });
}

savePictureButton.addEventListener('click', () => {
  const videoRect = videoWrapper.getBoundingClientRect();

  const canvas = document.createElement('canvas');
  canvas.width = videoRect.width;
  canvas.height = videoRect.height;

  const context = canvas.getContext('2d');

  const backgroundImage = new Image();
  backgroundImage.src = video.style.backgroundImage.slice(5, -2);

  backgroundImage.onload = () => {
    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    document.getElementById('imageNameModal').style.display = 'block';
  };
});


// Enable drag and drop for stickers
function enableDragAndDrop() {
  const stickersElements = document.querySelectorAll('.stickers');

  stickersElements.forEach(sticker => {
    sticker.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', event.target.src);
      event.dataTransfer.setData('sticker-id', event.target.dataset.stickerId || '');
    });
  });
}

video.addEventListener('dragover', (event) => event.preventDefault());

// Ensure the position is being calculated and saved correctly during drop
video.addEventListener('drop', (event) => {
  event.preventDefault();
  
  const stickerSrc = event.dataTransfer.getData('text/plain');
  const stickerId = event.dataTransfer.getData('sticker-id');

  if (stickerId) {
    const stickerElement = document.querySelector(`[data-sticker-id="${stickerId}"]`);
    moveSticker(event, stickerElement);
  }
  else if (stickerSrc) {
    const newSticker = document.createElement('img');
    newSticker.src = stickerSrc;
    newSticker.classList.add('dropped-sticker');

    const uniqueStickerId = `sticker-${Date.now()}`;
    newSticker.dataset.stickerId = uniqueStickerId;

    newSticker.draggable = true;
    newSticker.style.width = '64px';
    newSticker.style.height = '64px';
    newSticker.style.position = 'absolute';

    newSticker.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', event.target.src);
      event.dataTransfer.setData('sticker-id', event.target.dataset.stickerId);
    });
    overlay.appendChild(newSticker);

    const relativeX = (event.clientX - overlay.getBoundingClientRect().left) / overlay.clientWidth;
    const relativeY = (event.clientY - overlay.getBoundingClientRect().top) / overlay.clientHeight;

    stickers.push({
      element: newSticker,
      relativeX: relativeX,
      relativeY: relativeY,
      originalWidth: 64,
      originalHeight: 64
    });

    moveSticker(event, newSticker);
  }
});



// Function to calculate and set sticker position
function moveSticker(event, stickerElement) {
  const overlayRect = overlay.getBoundingClientRect();
  const stickerRect = stickerElement.getBoundingClientRect();
  
  const x = event.clientX - overlayRect.left - (stickerRect.width / 2);
  const y = event.clientY - overlayRect.top - (stickerRect.height / 2);

  stickerElement.style.left = `${x}px`;
  stickerElement.style.top = `${y}px`;

  const sticker = stickers.find(s => s.element === stickerElement);
  if (sticker) {
    sticker.relativeX = x / overlayRect.width;
    sticker.relativeY = y / overlayRect.height;
  }
}

function syncStickersPosition() {
  const overlayRect = overlay.getBoundingClientRect();
  
  stickers.forEach(sticker => {
    const relativeX = sticker.relativeX * overlayRect.width;
    const relativeY = sticker.relativeY * overlayRect.height;

    sticker.element.style.left = `${relativeX}px`;
    sticker.element.style.top = `${relativeY}px`;
  });
}

async function fetchAsDataUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`HTTP error! Status: ${response.status}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
  catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
}

// Load stickers dynamically
async function loadStickers() {
  const stickersFolderRef = ref(storage, 'stickers/');
  const stickersContainer = document.querySelector('.stickers-container');

  try {
    const stickersList = await listAll(stickersFolderRef);
    for (const itemRef of stickersList.items) {
      const url = await getDownloadURL(itemRef);
      const stickerDataUrl = await fetchAsDataUrl(url);
      const img = document.createElement('img');
      img.src = stickerDataUrl;
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

cancelImageNameBtn.addEventListener('click', function() {
  document.getElementById('imageNameModal').style.display = 'none';
});

saveImageNameBtn.addEventListener('click', function() {
  imageName = document.getElementById('imageName').value;

  if (imageName) {
    console.log('Saving image with name:', imageName);
    // Close the modal first
    document.getElementById('imageNameModal').style.display = 'none';

    // After closing the modal, proceed to upload the image
    const videoRect = videoWrapper.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.width = videoRect.width;
    canvas.height = videoRect.height;

    const context = canvas.getContext('2d');

    const backgroundImage = new Image();
    backgroundImage.src = video.style.backgroundImage.slice(5, -2);

    backgroundImage.onload = () => {
      context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
      drawStickersSequentially(context, canvas, stickers); // This will handle the drawing and upload
    };
  } else {
    alert('Please enter a name for the image.');
  }
});

// Initialize everything on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  setupCamera();
  loadStickers().then(enableDragAndDrop);
  window.addEventListener('resize', syncOverlaySize);
  window.addEventListener('resize', updateOverlayPosition);
  window.addEventListener('resize', syncStickersPosition);
});
