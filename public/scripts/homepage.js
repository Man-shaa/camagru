import { onAuthStateChanged, getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, getDoc, getDocs, addDoc, collection, orderBy, query, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";

// global variables
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

let currentUser = null;
const imagesPerPage = 5;
let currentPage = 1;
let totalImages = 0;
const imagesCollectionRef = collection(db, 'images');


// Fetch images from Firestore and handle pagination
function fetchImages(page) {
  const imagesContainer = document.getElementById('imagesContainer');
  imagesContainer.innerHTML = '';

  // Create a query that orders by 'createdAt' in descending order
  const imagesQuery = query(imagesCollectionRef, orderBy('createdAt', 'asc'));

  getDocs(imagesQuery)
    .then((querySnapshot) => {
      // Update total number of images
      totalImages = querySnapshot.size;

      // Calculate the start and end index for images to display
      const startIndex = (page - 1) * imagesPerPage;
      const endIndex = startIndex + imagesPerPage;

      // Iterate through Firestore documents and display images for the current page
      querySnapshot.docs.slice(startIndex, endIndex).forEach((doc) => {
        const imageUrl = doc.data().imageUrl;
				const fileName = doc.data().fileName;
        createImageElement(imageUrl, fileName, doc.id);
      });

      // Generate pagination buttons
      generatePaginationButtons();
    })
    .catch((error) => {
      console.log('Error getting documents:', error);
    });
}

function createImageElement(imageUrl, fileName, docId) {
	const imagesContainer = document.getElementById('imagesContainer');
	const imgElement = document.createElement('img');
	imgElement.src = imageUrl;
	imgElement.className = 'image';
	imgElement.alt = 'User uploaded image';
	imgElement.dataset.fileName = fileName; // Store file name as data attribute
	imgElement.setAttribute('data-doc-id', docId);
	imagesContainer.appendChild(imgElement);
}

// Function to generate pagination buttons
function generatePaginationButtons() {
	const paginationContainer = document.getElementById('pagination');
	paginationContainer.innerHTML = '';

	const totalPages = Math.ceil(totalImages / imagesPerPage);

	for (let i = 1; i <= totalPages; i++) {
		const button = document.createElement('button');
		button.innerText = i;
		button.classList.add('page-btn');
		if (i === currentPage) {
			button.classList.add('active');
		}
		button.addEventListener('click', () => {
			currentPage = i;
			fetchImages(currentPage);
		});
		paginationContainer.appendChild(button);
	}
}

// Initial fetch of images for the first page
fetchImages(currentPage);

// Upload and add a new image to Firestore when clicking on upload button
document.getElementById('fileInput').addEventListener('change', function(event) {
	if (!currentUser) {
		console.log("user must be logged to upload an image");
		return;
	}

	const file = event.target.files[0];
	if (file) {
		const uniqueFileName = `${currentUser.uid}_${Date.now()}_${file.name}`;
		const imageStorageRef = ref(storage, 'images/' + uniqueFileName);
		const metadata = {
			customMetadata: {
				userId: currentUser.uid,
				fileName: file.name
			}
		};

		uploadBytes(imageStorageRef, file, metadata)
		.then((snapshot) => {
			getDownloadURL(snapshot.ref)
			.then((url) => {
				addDoc(collection(db, 'images'), {
					UniqueImageName: uniqueFileName,
					imageUrl: url,
					fileName: file.name,
					userId: currentUser.uid,
					createdAt: new Date()
				})
				.then((docRef) => {
					createImageElement(url);
					window.location.reload();
				});
			})
			.catch((error) => {
				console.log("Error getting download URL: ", error);
			});
		})
		.catch((error) => {
			console.log("Error uploading file: ", error);
		});
	}
});

// User auth change listener
onAuthStateChanged(auth, (user) => {
	console.log("user status: ", user);
	const signinBtnContainer = document.getElementById('signin-btn-container');
	const logoutBtnContainer = document.getElementById('logout-btn-container');
	const uploadBtnContainer = document.getElementById('upload-container');

	if (user) {
		logoutBtnContainer.style.display = 'block';
		uploadBtnContainer.style.display = 'flex';
		currentUser = user;
	} else {
		signinBtnContainer.style.display = 'block';
	}
});

const logoutButton = document.getElementById('logout');

// Logout button listener
logoutButton.addEventListener('click', () => {
	signOut(auth)
	.then(() => {
		currentUser = null;
		window.location.reload();
	})
	.catch((error) => {
		console.log('Error signing out:', error);
	});
});

// Display popup image listener using event delegation
document.querySelector('.images-container').addEventListener('click', (event) => {
	if (event.target.tagName === 'IMG') {
		const clickedImage = event.target;
		const fileName = clickedImage.dataset.fileName;
		const imageUrl = clickedImage.src;

		const popupImageContainer = document.querySelector('.popup-image');
		popupImageContainer.style.display = 'block';
		popupImageContainer.querySelector('img').src = clickedImage.src;
		popupImageContainer.querySelector('.image-title').textContent = fileName;

		const deleteBtn = document.getElementById('delete-button');
		deleteBtn.style.display = 'none';

		// get userId from the image document in firestore
		const docId = clickedImage.getAttribute('data-doc-id');
		const imagePopupRef = doc(db, 'images', docId);

		getDoc(imagePopupRef)
		.then((docSnap) => {
			if (docSnap.exists()) {
				const userId = docSnap.data().userId;
				if (currentUser && currentUser.uid === userId) {
					deleteBtn.style.display = 'block';
					deleteBtn.onclick = () => {
						deleteImage(image); // Call the delete function
					};
				}
			}
			else {
				console.log("Document does not exist");
			}
		})
	}
});

// Close popup image listener using event delegation
document.querySelector('.popup-image span').onclick = () => {
	document.querySelector('.popup-image').style.display = 'none';
};

// Trigger file input when the upload button is clicked
document.getElementById('uploadButton').addEventListener('click', function() {
	document.getElementById('fileInput').click();
});
