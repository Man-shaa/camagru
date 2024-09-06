import { getFirestore, getDoc, getDocs, collection, orderBy, query, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

import { deleteFirebaseImage } from "./firebase-db.js";
import { deleteFirestoreImage } from "./firestore-db.js";
import { currentUser } from "./auth.js";

// global variables
const db = getFirestore();

const imagesPerPage = 5;
export let totalImages = 0;
let currentPage = 1;
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

// Initial fetch of images for the first page
fetchImages(currentPage);

export function createImageElement(imageUrl, fileName, docId) {
	const imagesContainer = document.getElementById('imagesContainer');
	const imgElement = document.createElement('img');
	imgElement.src = imageUrl;
	imgElement.className = 'image';
	imgElement.alt = 'User uploaded image';
	imgElement.dataset.fileName = fileName; // Store file name as data attribute
	imgElement.setAttribute('data-doc-id', docId);
	imagesContainer.appendChild(imgElement);
}

// Display popup image listener using event delegation
document.querySelector('.images-container').addEventListener('click', (event) => {
	if (event.target.tagName === 'IMG') {
		const clickedImage = event.target;
		const fileName = clickedImage.dataset.fileName;

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
						deleteFirestoreImage(imagePopupRef);
						deleteFirebaseImage(docSnap.data().uniqueImageName);
					};
				}
			}
			else {
				console.log("Document does not exist");
			}
		})
	}
});

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
			if (i !== currentPage) {
				currentPage = i;
				fetchImages(currentPage);
			}
		});
		paginationContainer.appendChild(button);
	}
}
