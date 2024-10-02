import { getFirestore, getDoc, updateDoc, arrayUnion, arrayRemove, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getCurrentUser } from "../auth.js";
import { deleteFirebaseImage } from "./firebase-db.js";
import { deleteFirestoreImage } from "./firestore-db.js";

const db = getFirestore();
const likeCountElement = document.getElementById('like-count');

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
		console.log(docId);
		const imagePopupRef = doc(db, 'images', docId);

		getDoc(imagePopupRef).then((docSnap) => {
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
				// Display likes
				updateLikeCount(docSnap);

				// Handle like button click
				handleLikeClick(docId);
			} else {
				console.log("Document does not exist");
			}
		});
	}
});

function updateLikeCount(docSnap) {
	const currentLikes = docSnap.data().likes || 0;
	likeCountElement.textContent = `${currentLikes} Likes`;
}

function handleLikeClick(docId) {
	const likeButton = document.getElementById('like-button');

	likeButton.onclick = () => {
		const currentUser = getCurrentUser();
		if (!currentUser) {
			console.log('User not logged in');
			return;
		}

		const imageDocRef = doc(db, 'images', docId);

		// Fetch the latest data from Firestore
		getDoc(imageDocRef).then((docSnap) => {
			if (docSnap.exists()) {
				const likedBy = docSnap.data().likedBy || [];
				const currentLikes = docSnap.data().likes || 0;

				// Optimistic UI update
				if (likedBy.includes(currentUser.uid)) {
					likeCountElement.textContent = `${currentLikes - 1} Likes`;
					updateLikes(docId, currentLikes - 1, arrayRemove(currentUser.uid));
				} else {
					likeCountElement.textContent = `${currentLikes + 1} Likes`;
					updateLikes(docId, currentLikes + 1, arrayUnion(currentUser.uid));
				}
			}
		});
	};

	function updateLikes(docId, newLikes, likeAction) {
		const imageDocRef = doc(db, 'images', docId);
		const validLikes = newLikes >= 0 ? newLikes : 0; // Ensure likes don't go below 0

		updateDoc(imageDocRef, { 
			likes: validLikes,
			likedBy: likeAction 
		})
		.catch((error) => {
			console.error("Error updating likes:", error);
		});
	}
}
