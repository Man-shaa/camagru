import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, addDoc, collection } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getStorage, ref, listAll, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";
import { initializeAuthListener, getCurrentUser } from "./auth.js";

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
let isPictureTaken = false;
let stickers = [];
let currentUser = null;

// init auth listener
initializeAuthListener((user) => {
  console.log('Logged user:', user);

  // Redirect if the user is not logged
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

    // Adjust sticker size proportionally based on the video scale
    const newWidth = sticker.originalWidth * videoScaleFactorX;
    const newHeight = sticker.originalHeight * videoScaleFactorY;
    stickerElement.style.width = `${Math.min(newWidth, 64)}px`; // Max size cap of 64px
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
  const videoRect = video.getBoundingClientRect(); // Get the rendered size of the video element
  
  // Create a canvas element with the same size as the rendered video
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  // Set the canvas width and height based on the rendered video dimensions
  canvas.width = videoRect.width;
  canvas.height = videoRect.height;
  
  // Draw the current video frame onto the canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  // Return the captured image as a Data URL
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
  // Get the current size of the video element
  const videoRect = videoWrapper.getBoundingClientRect(); // Use the wrapper's size for responsiveness
  console.log(videoRect);

  // Stop the video stream and replace it with the captured image
  video.srcObject = null;
  video.style.backgroundImage = `url(${imageDataUrl})`;
  video.style.backgroundSize = '100%';   // Ensures the image fills the space
  video.style.backgroundPosition = 'center';

  // Set the width and height based on the wrapper to ensure responsiveness
  video.style.width = videoRect.width;  // Keep the width of the video responsive
  video.style.height = videoRect.height; // Maintain aspect ratio

  // Sync overlay size and position
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
	const uniqueFileName = `${currentUserId}_${Date.now()}_${file.name}`;
	const imageStorageRef = ref(storage, 'images/' + uniqueFileName);
	const metadata = {
		customMetadata: {
			userId: currentUserId,
			fileName: file.name
		}
	};

  const blobFile = base64ToBlob(file, 'image/png');
  // console.log(blobFile);

  // setFileToSessionStorage(file, uniqueFileName);
	uploadBytes(imageStorageRef, blobFile, metadata)
	.then((snapshot) => {
		getDownloadURL(snapshot.ref)
		.then((url) => {
      console.log("final url :", url);
			addDoc(collection(db, 'images'), {
				uniqueImageName: uniqueFileName,
				imageUrl: url,
				fileName: "test",
				userId: currentUserId,
				createdAt: new Date()
			})  
			.then((docRef) => {
				// createImageElement(url, file.name, docRef.id);
        // setFileToSessionStorage(file);
				// window.location.reload();
			});
		})
		.catch((error) => {
			console.log("Error getting download URL: ", error);
		});
	})
	.catch((error) => {
		console.log("Error uploading file: ", error);
	});
};

function base64ToBlob(base64, type) {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  return new Blob([byteNumbers], { type: type });
}

function drawStickersSequentially(context, canvas, stickers) {
  const drawStickerPromises = stickers.map(sticker => {
    return new Promise((resolve) => {
      const stickerImage = new Image();
      stickerImage.src = sticker.element.src; // Use Data URL
      stickerImage.onload = () => {
        const stickerRect = sticker.element.getBoundingClientRect();
        const xPos = stickerRect.left - canvas.getBoundingClientRect().left;
        const yPos = stickerRect.top - canvas.getBoundingClientRect().top;
        context.drawImage(stickerImage, xPos, yPos, sticker.originalWidth, sticker.originalHeight);
        resolve();
      };
    });
  });

  Promise.all(drawStickerPromises).then(() => {
    const combinedImage = canvas.toDataURL('image/png');
    console.log(combinedImage);
    uploadImage(currentUser.uid, combinedImage);
  });
}

savePictureButton.addEventListener('click', () => {
  const videoRect = videoWrapper.getBoundingClientRect();

  // Create a canvas with the same dimensions as the video wrapper
  const canvas = document.createElement('canvas');
  canvas.width = videoRect.width;
  canvas.height = videoRect.height;

  const context = canvas.getContext('2d');

  // Draw the background image
  const backgroundImage = new Image();
  backgroundImage.src = video.style.backgroundImage.slice(5, -2);

  backgroundImage.onload = () => {
    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    drawStickersSequentially(context, canvas, stickers);
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

video.addEventListener('drop', (event) => {
  event.preventDefault();
  
  const stickerSrc = event.dataTransfer.getData('text/plain');
  const stickerId = event.dataTransfer.getData('sticker-id');

  if (stickerId) {
    const stickerElement = document.querySelector(`[data-sticker-id="${stickerId}"]`);
    moveSticker(event, stickerElement);
  }
  else if (stickerSrc) {
    // New sticker drop
    const newSticker = document.createElement('img');
    newSticker.src = stickerSrc;
    newSticker.classList.add('dropped-sticker');

    // Set unique identifier for this sticker for future moves
    const uniqueStickerId = `sticker-${Date.now()}`;
    newSticker.dataset.stickerId = uniqueStickerId;

    // Make the new sticker draggable
    newSticker.draggable = true;
    newSticker.style.width = '64px';  // Set max width
    newSticker.style.height = '64px'; // Set max height
    newSticker.style.position = 'absolute';

    newSticker.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', event.target.src);
      event.dataTransfer.setData('sticker-id', event.target.dataset.stickerId);
    });
    overlay.appendChild(newSticker);
    moveSticker(event, newSticker);

    // Save the new sticker with its initial position for responsiveness
    stickers.push({
      element: newSticker,
      relativeX: (event.clientX - overlay.getBoundingClientRect().left) / overlay.clientWidth,
      relativeY: (event.clientY - overlay.getBoundingClientRect().top) / overlay.clientHeight,
      originalWidth: 64,
      originalHeight: 64
    });
  }
});


// Function to calculate and set sticker position
function moveSticker(event, stickerElement) {
  const overlayRect = overlay.getBoundingClientRect();
  const x = event.clientX - overlayRect.left - 32; // Adjust for half the width (32px) of the sticker
  const y = event.clientY - overlayRect.top - 32;  // Adjust for half the height (32px) of the sticker

  stickerElement.style.left = `${x}px`;
  stickerElement.style.top = `${y}px`;

  // Update the sticker's relative position for future resizing
  const sticker = stickers.find(s => s.element === stickerElement);
  if (sticker) {
    sticker.relativeX = x / overlayRect.width;
    sticker.relativeY = y / overlayRect.height;
  }
}

// Sync the sticker positions when the overlay or window is resized
function syncStickersPosition() {
  const overlayRect = overlay.getBoundingClientRect();
  
  stickers.forEach(sticker => {
    // Calculate the new position based on the relative position and overlay size
    const relativeX = sticker.relativeX * overlayRect.width;
    const relativeY = sticker.relativeY * overlayRect.height;

    sticker.element.style.left = `${relativeX}px`;
    sticker.element.style.top = `${relativeY}px`;
  });
}

async function fetchAsDataUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob); // Convert the Blob to a Data URL
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error; // Rethrow to handle it in the calling function
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
      const stickerDataUrl = await fetchAsDataUrl(url); // Convert to Data URL
      const img = document.createElement('img');
      img.src = stickerDataUrl; // Use Data URL
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
  window.addEventListener('resize', syncStickersPosition);
});
