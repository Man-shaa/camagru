import { getFirestore, getDoc, getDocs, collection, orderBy, query, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

import { getCurrentUser } from "./auth.js";
import { deleteFirebaseImage } from "./firebase-db.js";
import { deleteFirestoreImage } from "./firestore-db.js";

const db = getFirestore();

// Close popup image listener using event delegation
document.querySelector('.popup-image span').onclick = () => {
	document.querySelector('.popup-image').style.display = 'none';
};

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
				const currentUser = getCurrentUser();
				console.log(currentUser, userId);
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
